import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { View, StyleSheet } from "react-native";
import { CommonActions, Link, useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { RootStackParamList } from "../../constants/RootStackParams";
import {
  Box,
  VStack,
  Heading,
  Input,
  InputField,
  Button,
  ButtonText,
  Text,
  FormControl,
  FormControlError,
  FormControlErrorText,
  Spinner,
} from "@gluestack-ui/themed";

export default function Login() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Login">>();
  const { theme } = useTheme();
  const { onLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const login = async () => {
    if (!email || !password) {
      setErrMessage("All forms must be filled");
      return;
    }
    setLoading(true);
    const result = await onLogin!(email, password);
    if (result.error) {
      setErrMessage(result.msg);
      setLoading(false);
    }
  };
  return (
    <Box h="$full" bg={theme === "dark" ? "$backgroundDark900" : "$backgroundLight00"}>

      <VStack space="lg" alignItems="center" px="$6" py="$8">
        <Heading color={theme === "dark" ? "$textLight50" : "$textDark900"}>Welcome!</Heading>

        <Box w="$full">
          <FormControl isInvalid={!!errMessage}>
            <Input borderRadius={"$lg"}>
              <InputField autoCapitalize="none" placeholder="Email" value={email} onChangeText={setEmail}/>
            </Input>

            <Input mt="$4"  borderRadius={"$lg"}>
              <InputField autoCapitalize="none" secureTextEntry placeholder="Password" value={password} onChangeText={setPassword}/>
            </Input>

            {errMessage ? (
              <FormControlError>
                <FormControlErrorText>{errMessage}</FormControlErrorText>
              </FormControlError>
            ) : null}
          </FormControl>
        </Box>

        <Button action="primary" variant="solid" w="$full" borderRadius="$lg"
          onPress={!loading ? login : undefined}
          isDisabled={loading}>
          {loading ? (
            <Spinner color="$textLight50" />
          ) : (
            <ButtonText>Log In</ButtonText>
          )}
        </Button>
        
        <Box w={"$full"} flexDirection="row" justifyContent="center">
          <Text color={theme === "dark" ? "$textLight50" : "$textDark900"}>Don't have an account? </Text>
          <Link action={CommonActions.navigate("Register")} style={{ textDecorationLine: "underline" }}>
            <Text>Click here!</Text>
          </Link>
        </Box>
      </VStack>
    </Box>
  );
};
