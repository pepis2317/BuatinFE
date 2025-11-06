import { View } from "react-native";
import TopBar from "../../components/TopBar";
import NotificationsList from "../../components/NotificationsList";

export default function Notifications(){
    return(
        <View>
            <TopBar title={"Notifications"} showBackButton={true}/>
            <NotificationsList/>
        </View>
    )
}