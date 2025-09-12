import { ScrollView, View, Text, useWindowDimensions, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import TopBar from "../../components/TopBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useCallback, useEffect, useState } from "react";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { PostResponse } from "../../types/PostResponse";
import { useTheme } from "../context/ThemeContext";
import PostCard from "../../components/PostCard";

const FirstRoute = () => (
    <View style={{ flex: 1, backgroundColor: '#ff4081' }} />
);

const SecondRoute = ({ ownerId, navigation }: { ownerId: string, navigation: any }) => {
    const [posts, setPosts] = useState<PostResponse[]>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [total, setTotal] = useState(0)
    const { theme } = useTheme()
    const handleFetch = useCallback(async (pageNum: number) => {
        setLoading(true);
        const result = await fetchPosts(pageNum);
        if (result.error) {
            alert(result.msg);
        } else {
            setPosts(prev => (pageNum === 1 ? result.posts : [...prev, ...result.posts]));
            setTotal(result.total ?? 0);
        }
        setLoading(false);
        setRefresh(false);
    }, []);
    useEffect(() => {
        handleFetch(page);
    }, [page, handleFetch]);
    const loadMore = () => {
        if (!loading && posts.length < total) setPage(prev => prev + 1);
    };
    const onRefresh = useCallback(() => {
        setRefresh(true);
        setTotal(0);
        setPosts([]);
        setPage(1);
        handleFetch(1);
    }, [handleFetch]);
    const fetchPosts = async (pageNum: number) => {
        try {
            const queryString = `/get-posts?AuthorId=${ownerId}&pageSize=3&pageNumber=${pageNum}`;
            const response = await axios.get(`${API_URL}${queryString}`);
            return response.data;
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    };
    return (
        <View style={{ flex: 1 }}>
            {posts.length > 0 ?
                <FlatList
                    data={posts}
                    numColumns={3}
                    keyExtractor={(post) => post.postId}
                    renderItem={({ item, index }) => (
                        <PostCard post={item} onPress={() =>
                            navigation.navigate('PostDetails', {
                                authorId: ownerId,
                                initialPostId: item.postId
                            })} />
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={1}
                    refreshControl={
                        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    }
                    ListFooterComponent={
                        loading ?
                            <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                            :
                            <View style={{ marginTop: 64 }} />
                    }
                >

                </FlatList> : <></>}
        </View>
    )
}
const routes = [
    { key: 'first', title: 'Details' },
    { key: 'second', title: 'Posts' },
];
type ProducerDetailProps = NativeStackScreenProps<RootStackParamList, "ProducerDetails">;
export default function ProducerDetails({ navigation, route }: ProducerDetailProps) {
    const { producer } = route.params;
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0)
    return (
        <View style={{ flex: 1 }}>
            <TopBar title={producer.producerName} showBackButton />
            <TabView
                style={{ flex: 1 }}
                navigationState={{ index, routes }}
                renderScene={({ route }) => {
                    switch (route.key) {
                        case 'first':
                            return <FirstRoute />;
                        case 'second':
                            return <SecondRoute ownerId={producer.owner.userId} navigation={navigation} />;
                        default:
                            return null;
                    }
                }}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        scrollEnabled={false}
                        indicatorStyle={{ backgroundColor: '#5CCFA3' }}
                        style={{ backgroundColor: '#222831' }}
                    />
                )}
            />
        </View>
    );
}