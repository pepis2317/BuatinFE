import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { View, StyleSheet } from "react-native";
// import ColoredButton from "../../components/ColoredButton";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
// import ErrorComponent from "../../components/ErrorComponent";
import { RootStackParamList } from "../../constants/RootStackParams";
// import TextInputComponent from "../../components/TextInputComponent";
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
    <Box
      flex={1}
      px="$6"
      justifyContent="center"
      bg={theme === "dark" ? "$backgroundDark900" : "$backgroundLight50"}
    >
      <VStack space="lg" alignItems="center">
        <Heading color={theme === "dark" ? "$textLight50" : "$textDark900"}>
          Welcome!
        </Heading>

        <VStack space="md" w="$full">
          <FormControl isInvalid={!!errMessage}>
            <Input>
              <InputField
                autoCapitalize="none"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
              />
            </Input>

            <Input mt="$3">
              <InputField
                autoCapitalize="none"
                secureTextEntry
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
              />
            </Input>

            {errMessage ? (
              <FormControlError mt="$2">
                <FormControlErrorText>{errMessage}</FormControlErrorText>
              </FormControlError>
            ) : null}
          </FormControl>
        </VStack>

        <Button
          action="primary"
          variant="solid"
          w="$full"
          h={48}
          borderRadius="$lg"
          onPress={!loading ? login : undefined}
          isDisabled={loading}
        >
          {loading ? (
            <Spinner color="$textLight50" />
          ) : (
            <ButtonText>Log In</ButtonText>
          )}
        </Button>

        <Text
          mt="$3"
          color={theme === "dark" ? "$textLight50" : "$textDark900"}
          textDecorationLine="underline"
          onPress={() => navigation.navigate("Register")}
        >
          New to our app? Register here
        </Text>
      </VStack>
    </Box>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 10,
    gap: 10,
    alignItems: "center",
  },
  errorContainer: {
    padding: 15,
    backgroundColor: "#31363F",
    borderRadius: 5,
  },
  textInput: {
    backgroundColor: "white",
    height: 50,
    padding: 10,
    borderRadius: 5,
  },
});
