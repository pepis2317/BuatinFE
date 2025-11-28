import { Alert, ScrollView, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import ColoredButton from "./ColoredButton";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import { X } from "lucide-react-native";
export interface MessageAttachmentsRef {
    buildFormData: () => Promise<FormData>;
}
interface Props {
    attachments: string[];
    setAttachments: React.Dispatch<React.SetStateAction<string[]>>;
}


export default function MessageAttachmentsComponent({ attachments, setAttachments }: { attachments: string[], setAttachments: React.Dispatch<React.SetStateAction<string[]>> }) {

    const pickFromFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: true,                    // allow multiple selection
                type: "*/*",                       // any file type
                copyToCacheDirectory: true,        // ensures a stable file:// URI you can read
            });

            // Newer SDKs use `canceled` + `assets`
            // Older SDKs return a single selection with {type:'success', uri,...}
            if ((result as any).canceled) {
                return;
            }

            const pickedAssets =
                "assets" in result
                    ? result.assets
                    : (result ? [result] : []);
            if (!pickedAssets) return
            const newUris = pickedAssets
                .map((a: any) => a?.uri ?? a?.file?.uri)
                .filter(Boolean) as string[];

            if (!newUris.length) return;

            setAttachments((prev) => [...prev, ...newUris]);
        } catch (err: any) {
            Alert.alert("File pick error", err?.message ?? "Unknown error");
        }
    };
    const pickFromGallery = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Permission needed", "Please allow Photos permission.");
            return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });
        if (res.canceled) return;

        const uris = res.assets?.map((a) => a.uri).filter(Boolean) ?? [];
        setAttachments((prev) => [...prev, ...uris]);
    };
    const removeAttachmentAt = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <View>
            <ScrollView horizontal>
                {attachments.map((uri, index) => (
                    <View key={index} >
                        <View style={{ width: 150, height: 150 }}>
                            <Text>{uri}</Text>
                        </View>
                        <TouchableOpacity style={styles.removeAttachmentButton} onPress={() => removeAttachmentAt(index)}>
                            <X size={20} color={"white"} />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <ColoredButton title={"add image attachments"} onPress={() => pickFromGallery()} />
            <ColoredButton title={"add file attachments"} onPress={() => pickFromFiles()} />
        </View>
    )
}
const styles = StyleSheet.create({
    removeAttachmentButton: {
        position: 'absolute',
        width: 24,
        height: 24,
        right: 5,
        top: 5,
        backgroundColor: '#31363F',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'

    }
})