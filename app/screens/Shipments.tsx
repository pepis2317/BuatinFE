import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View } from "react-native";
import TopBar from "../../components/TopBar";
import ShipmentsList from "../../components/ShipmentsList";

type ShipmentsProps = NativeStackScreenProps<RootStackParamList, "Shipments">

export default function Shipments({ navigation, route }: ShipmentsProps) {
    return (
        <View style={{flex:1}}>
            <TopBar title={"Incoming Shipments"} showBackButton={false} />
            <ShipmentsList navigation={navigation} isSeller={false}/>
        </View>
    )
}