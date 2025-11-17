import { ScrollView , Text} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../constants/RootStackParams";
import ColoredButton from "../../components/ColoredButton";
import { SellerResponse } from "../../types/SellerResponse";

export default function SellerHome() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    
    return (
        <ScrollView>
            <Text>This is home page for seller</Text>
            <ColoredButton title={"settings nigga"} onPress={()=>navigation.navigate("Settings")}/>
            <ColoredButton title={"Test"} style={{ backgroundColor: "#5CCFA3", width: "100%" }} onPress={()=>navigation.navigate("CreatePost")} />
        </ScrollView>

    )
}