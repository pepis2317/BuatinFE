import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../constants/RootStackParams"
import { View } from "react-native"
import TopBar from "../../components/TopBar"
import ShipmentsList from "../../components/ShipmentsList"

type ShipmentsProps = NativeStackScreenProps<RootStackParamList, "SellerIncomingShipments">

export default function SellerIncomingShipments({ navigation, route }: ShipmentsProps) {
    return (
        <View style={{flex:1}}>
            <TopBar title={"Incoming Shipments"} showBackButton />
            <ShipmentsList navigation={navigation} isSeller={false}/>
        </View>
    )
}