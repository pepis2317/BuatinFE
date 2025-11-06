import { useRef } from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from "react-native";
import WebView from "react-native-webview";

export default function PaymentModal({
    showPayment,
    snapUrl,
    closePaymentModal,
    onSuccess,
    onFailed,
    onLoadEnd,
}: {
    showPayment: boolean;
    snapUrl: string;
    closePaymentModal: () => void;
    onSuccess: () => void;
    onFailed: () => void;
    onLoadEnd: () => void;
}) {
    const handledRef = useRef(false); // prevents double-calls

    const handleRoute = (url: string) => {
        if (handledRef.current) return false;

        // Adjust these checks to your actual success/cancel return URLs
        const lower = url.toLowerCase();

        const isSuccess =
            lower.includes("success") ||
            lower.includes("transaction_status=settlement") ||
            lower.includes("status_code=200");

        const isCancel =
            lower.includes("cancel") ||
            lower.includes("deny") ||
            lower.includes("status_code=202");

        if (isSuccess) {
            handledRef.current = true;
            onSuccess();           // <-- actually call it
            return false;          // stop navigating away
        }

        if (isCancel) {
            handledRef.current = true;
            onFailed();            // <-- actually call it
            return false;
        }

        return true;             // allow normal navigation
    };

    return (
        <Modal
            visible={showPayment}
            animationType="slide"
            transparent={true}
            statusBarTranslucent={true}
            backdropColor={'red'}
            onRequestClose={closePaymentModal}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={closePaymentModal}>
                            <Text style={styles.closeText}>✕ Close</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Payment</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    {/* WebView */}
                    <WebView
                        source={{ uri: snapUrl }}
                        startInLoadingState
                        onLoadEnd={onLoadEnd}
                        originWhitelist={["*"]}
                        // Intercept before navigation; works on both iOS/Android
                        onShouldStartLoadWithRequest={(req) => handleRoute(req.url)}
                        // Fallback if you still want to watch state changes
                        onNavigationStateChange={(state) => handleRoute(state.url)}
                        renderLoading={() => (
                            <View style={{ padding: 16, alignItems: "center" }}>
                                <ActivityIndicator />
                                <Text>Loading payment…</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    payButton: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
    },
    payText: { color: "white", fontWeight: "600" },

    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 12,
        width: "90%",
        height: "80%",
        overflow: "hidden",
    },
    header: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },
    closeText: { color: "#007AFF", fontSize: 16 },
    title: { fontWeight: "600", fontSize: 16 },
    loader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
});