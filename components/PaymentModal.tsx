import { Modal, View, StyleSheet, TouchableOpacity, Text } from "react-native";
import WebView from "react-native-webview";

export default function PatmentModal({ showPayment, snapUrl, closePaymentModal, onSuccess, onFailed, onLoadEnd }: { showPayment: boolean, snapUrl: string, closePaymentModal: () => void, onSuccess: () => void, onFailed: () => void, onLoadEnd: () => void }) {
    return (
        <Modal
            visible={showPayment}
            animationType="slide"
            transparent={true}
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
                        <View style={{ width: 60 }} /> {/* spacing */}
                    </View>

                    {/* WebView */}
                    <WebView
                        source={{ uri: snapUrl }}
                        onLoadEnd={onLoadEnd}
                        startInLoadingState={true}
                        onNavigationStateChange={(state) => {
                            if (state.url.includes("success")) {
                                onSuccess
                                // setShowPayment(false);
                                // setShowSnapPaid(true)
                                // handle success
                            } else if (state.url.includes("cancel")) {
                                onFailed
                                // setShowPayment(false);
                                // setShowSnapFailed(true)
                            }
                        }}
                    />
                </View>
            </View>
        </Modal>
    )
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