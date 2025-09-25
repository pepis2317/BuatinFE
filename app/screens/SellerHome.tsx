import { ScrollView , Text} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../constants/RootStackParams";
import ColoredButton from "../../components/ColoredButton";
import { SellerResponse } from "../../types/SellerResponse";

export default function SellerHome() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dummySeller:SellerResponse ={
        sellerId: "6bdca1be-419f-45c2-9017-b93e8c8a0fa0",
        sellerName: "Surip Genteng",
        ownerId: "73f27f91-893f-43a4-9c73-760384adb70e",
        rating: 3,
        clients: 100,
        banner: null
    }
    return (
        <ScrollView>
            <Text>This is home page for seller</Text>
            <ColoredButton title={"Test"} style={{ backgroundColor: "#5CCFA3", width: "100%" }} onPress={()=>navigation.navigate("CreatePost",{seller:dummySeller})} />
        </ScrollView>

    )
}