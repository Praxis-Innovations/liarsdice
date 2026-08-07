import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Die, type DieFace } from "../shared/Die";

export type DieConfig = {
  face: DieFace;
  color: string;
  restRotate: string;
};

export type ScatteredDieConfig = DieConfig & {
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  /** Position across the physical table depth (Three.js Z axis, in px). */
  tableDepth?: number;
  opacity?: number;
  /** Starting spin used for the one-time hero toss. */
  tossRotate: string;
  /** Horizontal wobble during the throw from the navbar area. */
  throwOffsetX?: number;
  /** How far above the final position the die begins its throw. */
  throwDistance?: number;
};

/** Native fallback for scattered hero dice (web uses CssDice3D.web.tsx / Three.js). */
export function ScatteredDice({ dice, pipColor }: { dice: ScatteredDieConfig[]; pipColor: string }) {
  return (
    <>
      {dice.map((die, index) => (
        <TossedDie
          key={`${die.face}-${die.size}-${Math.round(die.left ?? 0)}-${index}`}
          die={die}
          index={index}
          pipColor={pipColor}
        />
      ))}
    </>
  );
}

function TossedDie({ die, index, pipColor }: { die: ScatteredDieConfig; index: number; pipColor: string }) {
  const radius = die.size * 0.24;
  const delay = 100 + index * 135;
  const throwX = die.throwOffsetX ?? 0;
  const throwY = -(die.throwDistance ?? 640);
  const rotation = useSharedValue(Number.parseFloat(die.tossRotate));
  const translateX = useSharedValue(throwX);
  const translateY = useSharedValue(throwY);
  const scale = useSharedValue(0.48);

  useEffect(() => {
    const restRotation = Number.parseFloat(die.restRotate);
    const reboundX = index % 2 === 0 ? 8 : -8;
    const landing = { damping: 13, stiffness: 130, mass: 0.65 };

    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(reboundX, { duration: 780, easing: Easing.out(Easing.cubic) }),
        withSpring(0, landing),
      ),
    );
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(14, { duration: 780, easing: Easing.out(Easing.cubic) }),
        withSpring(0, landing),
      ),
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.08, { duration: 780, easing: Easing.out(Easing.cubic) }),
        withSpring(1, landing),
      ),
    );
    rotation.value = withDelay(
      delay,
      withSequence(
        withTiming(restRotation + (index % 2 === 0 ? 14 : -14), { duration: 780, easing: Easing.out(Easing.cubic) }),
        withSpring(restRotation, landing),
      ),
    );
  }, [delay, die.restRotate, index, rotation, scale, translateX, translateY]);

  const tossStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: die.top,
          bottom: die.bottom,
          left: die.left,
          right: die.right,
          width: die.size,
          height: die.size,
          borderRadius: radius,
        },
        tossStyle,
      ]}
    >
      <Die face={die.face} color={die.color} pipColor={pipColor} size={die.size} />
    </Animated.View>
  );
}
