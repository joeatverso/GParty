"use client";

import { Check, Eye, EyeOff, Pause, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useGame } from "./GameProvider";

const FINAL_TIMER = 30;

function WagerEntry({ teamId, eligible }: { teamId: string; eligible: number }) {
  const { state, dispatch } = useGame();
  const [value, setValue] = useState<string>("");
  const [revealed, setRevealed] = useState(false);
  const team = state.teams.find((t) => t.id === teamId);
  const submitted = state.finalWagers[teamId] !== undefined;

  if (!team) return null;

  return (
    <div className="rounded-md border border-white/20 bg-jeopardy-blue-darker/70 p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg uppercase tracking-wider text-clue-text">
          {team.name}
        </span>
        <span
          className={
            "font-display " +
            (team.score < 0 ? "text-red-400" : "text-jeopardy-gold-bright")
          }
        >
          ${team.score.toLocaleString()}
        </span>
      </div>
      {!submitted ? (
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const num = Number.parseInt(value, 10);
            if (Number.isNaN(num)) return;
            dispatch({
              type: "FINAL_SET_WAGER",
              teamId,
              amount: num,
            });
          }}
        >
          <span className="font-display text-xl text-jeopardy-gold-bright">$</span>
          <Input
            type={revealed ? "number" : "password"}
            inputMode="numeric"
            min={0}
            max={eligible}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={team.score <= 0 ? "0 (cannot wager)" : "Wager"}
            disabled={team.score <= 0}
          />
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="rounded p-2 text-white/70 hover:bg-white/10"
            aria-label={revealed ? "Hide wager" : "Show wager"}
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
          <Button type="submit" size="sm" disabled={team.score <= 0 && value === ""}>
            Lock
          </Button>
          {team.score <= 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                dispatch({ type: "FINAL_SET_WAGER", teamId, amount: 0 })
              }
            >
              Skip
            </Button>
          ) : null}
        </form>
      ) : (
        <div className="mt-3 flex items-center gap-2 text-emerald-300">
          <Check className="size-4" /> Wager locked
        </div>
      )}
    </div>
  );
}

function AnswerRow({ teamId }: { teamId: string }) {
  const { state, dispatch } = useGame();
  const team = state.teams.find((t) => t.id === teamId);
  const answer = state.finalAnswers[teamId];
  if (!team) return null;

  return (
    <div className="rounded-md border border-white/20 bg-jeopardy-blue-darker/70 p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg uppercase tracking-wider text-clue-text">
          {team.name}
        </span>
        <span className="text-sm uppercase tracking-widest text-jeopardy-cream/70">
          Wager ${state.finalWagers[teamId]?.toLocaleString() ?? 0}
        </span>
      </div>
      <Input
        className="mt-3"
        placeholder="Team's written response"
        value={answer?.text ?? ""}
        onChange={(e) =>
          dispatch({
            type: "FINAL_SET_ANSWER",
            teamId,
            text: e.target.value,
          })
        }
      />
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="success"
          size="sm"
          onClick={() =>
            dispatch({ type: "FINAL_MARK_ANSWER", teamId, correct: true })
          }
        >
          <Check className="size-4" /> Correct
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() =>
            dispatch({ type: "FINAL_MARK_ANSWER", teamId, correct: false })
          }
        >
          <X className="size-4" /> Incorrect
        </Button>
        {answer?.correct === true ? (
          <span className="text-sm uppercase tracking-widest text-emerald-300">
            +${(state.finalWagers[teamId] ?? 0).toLocaleString()}
          </span>
        ) : answer?.correct === false ? (
          <span className="text-sm uppercase tracking-widest text-red-300">
            -${(state.finalWagers[teamId] ?? 0).toLocaleString()}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function FinalJeopardy() {
  const { state, dispatch } = useGame();
  const [timer, setTimer] = useState(FINAL_TIMER);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setTimer(FINAL_TIMER);
    setRunning(false);
  }, [state.finalPhase]);

  useEffect(() => {
    if (!running) return;
    if (timer <= 0) {
      setRunning(false);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [running, timer]);

  if (!state.data) return null;
  const final = state.data.final;
  const allWagersIn = state.teams.every(
    (t) => state.finalWagers[t.id] !== undefined,
  );
  const allMarked = state.teams.every(
    (t) => state.finalAnswers[t.id]?.correct !== null && state.finalAnswers[t.id]?.correct !== undefined,
  );

  return (
    <div className="board-gradient relative flex h-full w-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b-2 border-black/40 bg-jeopardy-blue-deep px-4 py-2 sm:px-6">
        <div className="font-display text-sm uppercase tracking-widest text-clue-text/80 sm:text-base">
          Final Jeopardy
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 py-8 text-center">
        {state.finalPhase === "category" ? (
          <div className="m-auto animate-clue-zoom">
            <div className="font-display text-2xl uppercase tracking-[0.4em] text-jeopardy-cream">
              The category is
            </div>
            <h1
              className="font-display mt-3 uppercase text-jeopardy-gold-bright text-clue-shadow"
              style={{ fontSize: "clamp(2.5rem, 9vw, 7rem)", lineHeight: 1 }}
            >
              {final.category}
            </h1>
            <div className="mt-10">
              <Button
                size="lg"
                onClick={() => dispatch({ type: "FINAL_REVEAL_CATEGORY" })}
              >
                Reveal to teams · take wagers
              </Button>
            </div>
          </div>
        ) : null}

        {state.finalPhase === "wagers" ? (
          <div className="w-full max-w-3xl animate-fade-in">
            <h2 className="font-display text-3xl uppercase tracking-widest text-jeopardy-cream">
              Place your wagers
            </h2>
            <p className="mt-1 text-sm text-clue-text/70">
              Category: <span className="font-display text-jeopardy-gold-bright">{final.category}</span>
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {state.teams.map((t) => (
                <WagerEntry
                  key={t.id}
                  teamId={t.id}
                  eligible={Math.max(t.score, 0)}
                />
              ))}
            </div>
            <div className="mt-8 flex items-center justify-end">
              <Button
                size="lg"
                onClick={() => dispatch({ type: "FINAL_BEGIN_CLUE" })}
                disabled={!allWagersIn}
              >
                Show the clue
              </Button>
            </div>
          </div>
        ) : null}

        {state.finalPhase === "clue" ? (
          <div className="m-auto w-full max-w-5xl animate-clue-zoom">
            <p
              className="font-display uppercase text-clue-text text-clue-shadow"
              style={{
                fontSize: "clamp(1.75rem, 5.5vw, 5rem)",
                lineHeight: 1.05,
              }}
            >
              {final.question}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-md border border-white/20 bg-jeopardy-blue-darker px-3 py-1.5">
                <span className="font-display text-xl tabular-nums text-jeopardy-gold-bright">
                  {timer.toString().padStart(2, "0")}s
                </span>
                <button
                  type="button"
                  onClick={() => setRunning((r) => !r)}
                  className="rounded p-1 text-white/80 hover:bg-white/10"
                  aria-label={running ? "Pause timer" : "Start timer"}
                >
                  {running ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimer(FINAL_TIMER);
                    setRunning(false);
                  }}
                  className="rounded p-1 text-white/80 hover:bg-white/10"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>
              <Button
                size="lg"
                onClick={() => dispatch({ type: "FINAL_BEGIN_ANSWERS" })}
              >
                Time&apos;s up · grade answers
              </Button>
            </div>
          </div>
        ) : null}

        {state.finalPhase === "answers" ? (
          <div className="w-full max-w-3xl animate-fade-in">
            <h2 className="font-display text-3xl uppercase tracking-widest text-jeopardy-cream">
              Grade the responses
            </h2>
            <p className="mt-1 text-sm text-clue-text/70">
              Correct response:{" "}
              <span className="font-display text-jeopardy-gold-bright">
                {final.answer}
              </span>
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {state.teams.map((t) => (
                <AnswerRow key={t.id} teamId={t.id} />
              ))}
            </div>
            <div className="mt-8 flex items-center justify-end">
              <Button
                size="lg"
                disabled={!allMarked}
                onClick={() => dispatch({ type: "FINAL_REVEAL" })}
              >
                Reveal final scores
              </Button>
            </div>
          </div>
        ) : null}

        {state.finalPhase === "reveal" ? (
          <div className="w-full max-w-3xl animate-fade-in">
            <h2 className="font-display text-3xl uppercase tracking-widest text-jeopardy-cream">
              Final standings
            </h2>
            <ul className="mt-6 space-y-2">
              {[...state.teams]
                .sort((a, b) => b.score - a.score)
                .map((t, idx) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-md border border-white/20 bg-jeopardy-blue-darker/70 px-4 py-3"
                  >
                    <span className="font-display text-xl uppercase tracking-wider text-clue-text">
                      {idx + 1}. {t.name}
                    </span>
                    <span
                      className={
                        "font-display text-2xl " +
                        (t.score < 0
                          ? "text-red-400"
                          : "text-jeopardy-gold-bright")
                      }
                    >
                      ${t.score.toLocaleString()}
                    </span>
                  </li>
                ))}
            </ul>
            <div className="mt-8 flex items-center justify-end">
              <Button size="lg" onClick={() => dispatch({ type: "END_GAME" })}>
                Crown the champion
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
