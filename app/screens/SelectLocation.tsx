import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { GoogleMaps } from "expo-maps";
import ColoredButton from "../../components/ColoredButton";
import TopBar from "../../components/TopBar";
import Colors from "../../constants/Colors";
import { MapPin } from "lucide-react-native";

type SelectLocationProps = NativeStackScreenProps<RootStackParamList, "SelectLocation">

export default function SelectLocation({ navigation, route }: SelectLocationProps) {
    const [location, setLocation] = useState<Location.LocationObject | undefined>()
    const [coords, setCoords] = useState<{ latitude: number, longitude: number }>()
    const { textColor } = useTheme()
    const { onSelectLocation, margin } = route.params

    const handleGetLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access location was denied")
            navigation.goBack()
        }
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location)
        setCoords(location.coords)
    }

    const handleSetLocation = (e: any) => {
        setCoords(e.coordinates)
    }

    const handleSelect = () => {
        if (coords) {
            onSelectLocation({ latitude: coords.latitude, longitude: coords.longitude })
            navigation.goBack()
        }
    }

    useEffect(() => {
        handleGetLocation()
    }, [])

    return (
        <View style={{ flex: 1 }}>

            <TopBar title={"Select Location"} showBackButton />
            
            {location ?
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, position: 'relative' }}>

                        {/* Map Pin */}
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, pointerEvents: 'none' }}>
                            <MapPin color={Colors.green} size={32} />
                        </View>

                        <GoogleMaps.View cameraPosition={{
                            coordinates: {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            },
                            zoom: 12
                        }}
                            style={{ flex: 1 }}
                            onCameraMove={(e) => handleSetLocation(e)}
                        />
                    </View>

                    {/* Set Location Button */}
                    <ColoredButton title={"Set Location"} style={{ marginBottom: margin ? 64 : 0, marginTop: 16, marginHorizontal: 16, backgroundColor: Colors.green }} onPress={() => handleSelect()} />
                </View>

                :
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={textColor} size={'large'} />
                </View>

            }

        </View>
    )
}