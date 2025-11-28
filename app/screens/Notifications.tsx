import { View } from "react-native";
import TopBar from "../../components/TopBar";
import NotificationsList from "../../components/NotificationsList";

export default function Notifications(){
    return(
        <View style={{flex:1}}>
            <TopBar title={"Notifications"} showBackButton={true}/>
            <NotificationsList/>
        </View>
    )
}