import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import TopBar from "../../components/TopBar";
import ConversationsList from "../../components/ConversationsList";
type ConversationsProps = NativeStackScreenProps<RootStackParamList, "Conversations">
export default function Conversations({ navigation, route }: ConversationsProps) {
    return (
        <View>
            <TopBar title={"Conversations"} showBackButton={false}/>
            <ConversationsList navigation={navigation}/>
        </View>
    )
}