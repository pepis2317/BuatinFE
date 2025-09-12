import { View } from "react-native";
import TopBar from "../../components/TopBar";

export default function Notifications(){
    return(
        <View>
            <TopBar title={"Notifications"} showBackButton={true}/>
        </View>
    )
}