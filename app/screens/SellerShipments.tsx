import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../constants/RootStackParams"
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native"
import TopBar from "../../components/TopBar"
import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { API_URL } from "../../constants/ApiUri"
import { useAuth } from "../context/AuthContext"
import { ShipmentResponse } from "../../types/ShipmentResponse"
import ShipmentComponent from "../../components/ShipmentComponent"
import { useTheme } from "../context/ThemeContext"
import ColoredButton from "../../components/ColoredButton"
import ShipmentsList from "../../components/ShipmentsList"

type SellerShipmentsProps = NativeStackScreenProps<RootStackParamList, "SellerShipments">
export default function SellerShipments({ navigation, route }: SellerShipmentsProps) {
    return (
        <View>
            <TopBar title={"Seller Shipmentss"} showBackButton />
            <ColoredButton title={"View shippable processes"} onPress={()=>navigation.navigate('Shippable')}/>
            <ShipmentsList navigation={navigation} isSeller={true}/>
        </View>
    )
}