import { View, Image, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../app/context/ThemeContext";
import Colors from "../constants/Colors";
import { ImageIcon, Pencil } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import TextInputComponent from "./TextInputComponent";
import ColoredButton from "./ColoredButton";
import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import ConfirmedModal from "./ConfirmedModal";
import { SellerResponse } from "../types/SellerResponse";
import { ReviewResponse } from "../types/ReviewResponse";

export default function SellerDetailComponent({ seller, navigation, editing }: { seller: SellerResponse, navigation: any, editing: boolean }) {
    const { subtleBorderColor, foregroundColor, borderColor, textColor, backgroundColor } = useTheme()
    const [banner, setBanner] = useState<string | null>(seller.banner)
    const [picture, setPicture] = useState<string | null>(seller.sellerPicture)
    const [sellerName, setSellerName] = useState<string>('')
    const [sellerDescription, setSellerDescription] = useState<string>('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setSellerName(seller.sellerName)
        setSellerDescription(seller.description ? seller.description : "")
    }, [])

    const hasChanged = useMemo(() => {
        return (banner ?? null) !== (seller.banner ?? null)
            || (picture ?? null) !== (seller.sellerPicture ?? null)
            || (sellerName ?? '') !== (seller.sellerName ?? '')
            || (sellerDescription ?? '') !== (seller.description ?? '');
    }, [banner, seller.banner, picture, seller.sellerPicture, sellerName, seller.sellerName, sellerDescription, seller.description]);

    const updateData = async (formData: FormData) => {
        try {
            const response = await axios.put(`${API_URL}/edit-seller`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });

            return response.data;
        } catch (e) {
            return {
                error: true,
                msg: (e as any).response?.data?.detail || "An error occurred"
            };
        }
    }

    const handleUpdateData = async () => {
        setLoading(true)
        const formData = new FormData()
        formData.append("sellerId", seller.sellerId)
        formData.append("sellerName", sellerName)
        formData.append("description", sellerDescription)

        if (banner != seller.banner && banner) {
            let bannerName = banner.split("/").pop();
            let match = /\.(\w+)$/.exec(bannerName || "");
            let bannerType = match ? `image/${match[1]}` : `image`;
            formData.append("banner", {
                uri: banner,
                name: bannerName,
                type: bannerType
            } as any)
        }

        if (picture != seller.sellerPicture && picture) {
            let pictureName = picture.split("/").pop();
            let match = /\.(\w+)$/.exec(pictureName || "");
            let pictureType = match ? `image/${match[1]}` : `image`;
            formData.append("sellerPicture", {
                uri: picture,
                name: pictureName,
                type: pictureType
            } as any)
        }

        const result = await updateData(formData)
        if (!result.error) {
            setShowSuccess(true)
        }
        setLoading(false)
    }

    const pickBannerAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            aspect: [3, 1]
        })
        if (!result.canceled) {
            setBanner(result.assets[0].uri);
        }
    }

    const pickPictureAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            aspect: [1, 1]
        })
        if (!result.canceled) {
            setPicture(result.assets[0].uri);
        }
    }
    
    const date = new Date(seller.createdAt)

    return (
        <View style={{ marginBottom: -36}}>

            <ConfirmedModal isFail={false} visible={showSuccess} message={"Seller data has been updated"} onPress={() => navigation.goBack()}/>

            {/* Profile Banner */}
            <TouchableOpacity onPress={pickBannerAsync} style={{ position: 'relative' }} disabled={!editing}>
                {banner ?
                    <Image src={banner} style={styles.banner} />
                    :
                    <View style={[styles.banner, { backgroundColor: subtleBorderColor }]} >
                        <ImageIcon size={50} color={borderColor} />
                    </View>
                }
                {editing ?
                    <View style={[styles.pencil, { right: 10, top: 10 }]}>
                        <Pencil color={textColor} size={16} />
                    </View>
                    : <></>
                }
            </TouchableOpacity>
            
            {/* Name & About */}
            <View style={styles.info}>
                <TouchableOpacity onPress={pickPictureAsync} disabled={!editing} style={styles.pictureContainer}>
                    <Image style={[styles.picture, { backgroundColor: subtleBorderColor, borderColor:borderColor }]} src={picture ? picture : ""} />

                    {editing ?
                        <View style={[styles.pencil, { right: -5, top: -5 }]}>
                            <Pencil color={textColor} size={16} />
                        </View>
                        : <></>
                    }
                </TouchableOpacity>

                {editing ?
                    <View style={styles.textContainer}>
                        <View>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 5 }}>Seller Name</Text>
                            <TextInputComponent placeholder="Seller Name" value={sellerName} onChangeText={setSellerName} />
                        </View>
                        <View>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 5 }}>Description</Text>
                            <TextInputComponent placeholder="Seller Description" value={sellerDescription} onChangeText={setSellerDescription} multiline style={styles.descContainer} />
                        </View>
                        {hasChanged == true ? <ColoredButton title={"Save Changes"} style={{ backgroundColor: Colors.green }} isLoading={loading} onPress={() => handleUpdateData()} /> : <ColoredButton title={"Save Changes"} style={{ backgroundColor: Colors.darkBackground }} disabled />}
                    </View> :
                    <View>
                        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 24 }}>{sellerName}</Text>
                        <Text style={{ color: Colors.darkGray, marginBottom: 10, fontSize: 12 }}>Est. {date.toLocaleDateString('en-GB')}</Text>
                        <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 5 }}>About</Text>
                        <View style={[styles.defaultDescriptionContainer, { backgroundColor: foregroundColor }]}>
                            <Text style={{ color: textColor }}>{sellerDescription}</Text>
                        </View>
                    </View>
                }
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    info: {
        position: 'relative',
        top: -50,
        paddingHorizontal: 16,
    },

    defaultDescriptionContainer: {
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12
    },

    descContainer: {
        height: 100,
        textAlignVertical: 'top'
    },
    textContainer: {
        marginTop: 10,
        gap: 10,
    },
    pencil: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 32,
        height: 32,
        borderRadius: 32,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute'
    },

    banner: {
        width: "100%",
        aspectRatio: 3,      // width : height = 3 : 1
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    pictureContainer: {
        position: 'relative',
    },
    picture: {
        width: 72,
        aspectRatio: 1,
        borderRadius: 24,
        borderWidth:1,
    },
    
    seller: {
        alignItems: "center",
        width: "50%",
        overflow: 'hidden',
        position: 'relative',
    },
    lightSeller: {
        alignItems: "center",
        width: "50%",
        overflow: 'hidden',
        position: 'relative',
    },
    

    darkTitle: {
        color: 'white',
        fontWeight: 'bold',
    },
    darkText: {
        color: 'white',
        fontSize: 12
    },
    lightText: {
        color: 'black'
    },
    lightTitle: {
        color: 'black',
        fontWeight: 'bold',
    },
});
