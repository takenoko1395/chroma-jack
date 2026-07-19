import { Color } from '../models/color/Color';
import type { GameState } from '../models/game/Game';
import { GAME_CONFIG } from '../models/game/gameConfig';
import type { NormalRoundEndReason, RoundResult } from '../models/game/Round';
import { ColorCard, ColorCardCreationFailure } from '../models/hand/ColorCard';
import { Hand, HandAdditionStatus } from '../models/hand/Hand';
import type { IntegerRange } from '../models/shared/IntegerRange';
import type { RandomGenerator } from '../repositories/RandomGenerator';

export const INITIAL_GAME_STATE: GameState = {
  phase: 'notStarted',
  totalRounds: GAME_CONFIG.totalRounds,
  currentRoundNumber: 0,
  currentHand: null,
  currentCard: null,
  remainingDeck: [],
  roundResults: [],
};

function generateColor(random: RandomGenerator, range: IntegerRange): Color {
  const color = Color.create(
    random.nextInteger(range),
    random.nextInteger(range),
    random.nextInteger(range),
  );
  if (!(color instanceof Color)) {
    throw new RangeError(
      `Random generator returned an invalid color: ${color}`,
    );
  }
  return color;
}

function generateCard(
  random: RandomGenerator,
  roundNumber: number,
  cardNumber: number,
): ColorCard {
  const range = GAME_CONFIG.cardColorRange;
  const id = `round-${roundNumber}-card-${cardNumber}`;
  const red = random.nextInteger(range);
  const green = random.nextInteger(range);
  const blue = random.nextInteger(range);
  const generatedCard = ColorCard.create(id, red, green, blue);

  if (generatedCard instanceof ColorCard) return generatedCard;
  if (generatedCard === ColorCardCreationFailure.Black) {
    const nonBlackCard = ColorCard.create(id, red, green, 1);
    if (nonBlackCard instanceof ColorCard) return nonBlackCard;
  }
  throw new RangeError(
    `Random generator returned an invalid card: ${generatedCard}`,
  );
}

function createDeck(random: RandomGenerator, roundNumber: number): ColorCard[] {
  return Array.from({ length: GAME_CONFIG.deckSize }, (_, index) =>
    generateCard(random, roundNumber, index + 1),
  );
}

function createRound(
  state: GameState,
  random: RandomGenerator,
  roundNumber: number,
): GameState {
  const currentHand = new Hand(
    generateColor(random, GAME_CONFIG.initialColorRange),
  );
  const deck = createDeck(random, roundNumber);
  return {
    ...state,
    phase: 'playing',
    currentRoundNumber: roundNumber,
    currentHand,
    currentCard: deck[0] ?? null,
    remainingDeck: deck.slice(1),
  };
}

function finishRound(
  state: GameState,
  reason: NormalRoundEndReason,
): GameState {
  if (state.phase !== 'playing' || state.currentHand === null) return state;

  const result: RoundResult = {
    roundNumber: state.currentRoundNumber,
    finalHand: state.currentHand,
    burstHand: null,
    score: state.currentHand.calculateScore(),
    endReason: reason,
  };
  return {
    ...state,
    phase: 'roundFinished',
    roundResults: [...state.roundResults, result],
  };
}

function finishBurstRound(state: GameState, burstHand: Hand): GameState {
  if (state.phase !== 'playing' || state.currentHand === null) return state;

  const result: RoundResult = {
    roundNumber: state.currentRoundNumber,
    finalHand: state.currentHand,
    burstHand,
    score: 0,
    endReason: 'burst',
  };
  return {
    ...state,
    phase: 'roundFinished',
    roundResults: [...state.roundResults, result],
  };
}

function revealNextCard(state: GameState): GameState {
  const [nextCard, ...remainingDeck] = state.remainingDeck;
  if (nextCard === undefined) {
    return finishRound({ ...state, currentCard: null }, 'deckExhausted');
  }
  return { ...state, currentCard: nextCard, remainingDeck };
}

export function startGame(random: RandomGenerator): GameState {
  return createRound(INITIAL_GAME_STATE, random, 1);
}

export function acceptCurrentCard(state: GameState): GameState {
  if (
    state.phase !== 'playing' ||
    state.currentHand === null ||
    state.currentCard === null
  ) {
    return state;
  }

  const addition = state.currentHand.add(state.currentCard);
  if (addition.status === HandAdditionStatus.Burst) {
    return finishBurstRound({ ...state, currentCard: null }, addition.hand);
  }

  return revealNextCard({ ...state, currentHand: addition.hand });
}

export function discardCurrentCard(state: GameState): GameState {
  if (state.phase !== 'playing' || state.currentCard === null) return state;
  return revealNextCard(state);
}

export function standCurrentRound(state: GameState): GameState {
  return finishRound(state, 'stood');
}

export function startNextRound(
  state: GameState,
  random: RandomGenerator,
): GameState {
  if (state.phase !== 'roundFinished') return state;
  if (state.currentRoundNumber >= state.totalRounds) {
    return { ...state, phase: 'gameFinished' };
  }
  return createRound(state, random, state.currentRoundNumber + 1);
}

export function returnToTitle(): GameState {
  return INITIAL_GAME_STATE;
}
