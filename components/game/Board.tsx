"use client";

import { useEffect } from "react";

import { useGame } from "./GameProvider";

const HIGHLIGHT_DURATION_MS = 2000;

function formatValue(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function Board() {
  const { state, dispatch } = useGame();
  const pending = state.pendingSelection;

  useEffect(() => {
    if (!pending) return;
    const id = window.setTimeout(() => {
      dispatch({ type: "SELECT_CLUE", selection: pending });
    }, HIGHLIGHT_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [pending, dispatch]);

  if (!state.data) return null;

  const cats =
    state.round === "jeopardy" ? state.data.jeopardy : state.data.double;

  return (
    <div className="board-gradient flex h-full w-full flex-col gap-2 p-3 sm:p-4">
      <div className="grid h-full grid-cols-6 gap-2 sm:gap-3">
        {cats.map((cat, ci) => (
          <div
            key={`${ci}-${cat.name}`}
            className="cell-gradient flex items-center justify-center rounded-sm border-2 border-black p-1 text-center sm:p-2"
          >
            <span className="font-display text-base uppercase leading-tight text-clue-text text-letterpress sm:text-xl md:text-2xl lg:text-3xl">
              {cat.name}
            </span>
          </div>
        ))}

        {Array.from({ length: 5 }).map((_, ri) =>
          cats.map((cat, ci) => {
            const clue = cat.clues[ri];
            if (!clue) return null;
            const played = clue.played;
            const isPending =
              !!pending &&
              pending.categoryIdx === ci &&
              pending.clueIdx === ri;

            const baseClass = played
              ? "rounded-sm border-2 border-black bg-jeopardy-blue-darker"
              : "cell-gradient rounded-sm border-2 border-black transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeopardy-gold-bright";
            const highlightClass = isPending
              ? " animate-clue-highlight relative z-10"
              : "";

            return (
              <button
                key={`${ci}-${ri}`}
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SELECT_CLUE",
                    selection: { categoryIdx: ci, clueIdx: ri },
                  })
                }
                disabled={played || !!pending}
                className={baseClass + highlightClass}
                aria-label={
                  played ? "Clue already played" : `Select ${formatValue(clue.value)}`
                }
              >
                {!played ? (
                  <span
                    className="font-display block text-jeopardy-gold-bright text-clue-shadow"
                    style={{ fontSize: "clamp(1.5rem, 4vw, 4rem)" }}
                  >
                    {formatValue(clue.value)}
                  </span>
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
