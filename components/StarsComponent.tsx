// Rating.tsx
import { Star } from "lucide-react-native";
import React, { useMemo, useState, useEffect, memo } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type RatingProps = {
    /** Current rating (0–5). If omitted, the component manages its own state. */
    value?: number;
    /** Called when user selects a new rating. */
    onChange?: (next: number) => void;
    /** Size of the star text (in dp). */
    size?: number;
    /** Spacing between stars (in dp). */
    gap?: number;
    /** Color for filled stars. */
    activeColor?: string;
    /** Color for unfilled stars. */
    inactiveColor?: string;
    /** Prevent user interaction but still show value. */
    disabled?: boolean;
    /** Make it display-only (no touch feedback). */
    readOnly?: boolean;
    /** Optional testID prefix for E2E testing. */
    testIDPrefix?: string;
};

const clamp = (n: number, min = 0, max = 5) => Math.max(min, Math.min(max, n));

const Stars: React.FC<RatingProps> = memo(
    ({
        value,
        onChange,
        size = 24,
        gap = 8,
        activeColor = "#FFC107",
        inactiveColor = "#C7C7CC",
        disabled = false,
        readOnly = false,
        testIDPrefix = "rating",
    }) => {
        // Uncontrolled internal state if `value` not provided
        const [internal, setInternal] = useState<number>(clamp(value ?? 0));

        // Keep internal in sync if parent controls `value`
        useEffect(() => {
            if (typeof value === "number") setInternal(clamp(value));
        }, [value]);

        const stars = useMemo(() => [1, 2, 3, 4, 5], []);

        const setRating = (n: number) => {
            if (disabled || readOnly) return;
            if (typeof value === "number") {
                onChange?.(n);
            } else {
                setInternal(n);
                onChange?.(n);
            }
        };

        return (
            <View style={[styles.row, { columnGap: gap }]}>
                {stars.map((i) => {
                    const filled = i <= internal;
                    return (
                        <TouchableOpacity
                            key={i}
                            disabled={disabled || readOnly}
                            onPress={() => setRating(i)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={`Rate ${i} out of 5`}
                            accessibilityState={{ disabled: disabled || readOnly, selected: filled }}
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                            testID={`${testIDPrefix}-star-${i}`}
                        >
                            <Star color={"gold"} fill={filled?"gold":"transparent"}/>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    star: {
        lineHeight: 28, // a bit bigger than default for nicer tap target
    },
});

export default Stars;
