import * as FileSystem from 'expo-file-system/legacy';
import { Directory, Paths, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React from "react";
import { Alert, Platform } from "react-native";
import { useAuth } from "../app/context/AuthContext";

type AttachmentDto = {
  attachmentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string; // Azure SAS or proxy
  expiresAt: string;   // ISO
};

export const useAttachmentDownload = () => {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const { onGetUserToken } = useAuth()

  const downloadAttachment = React.useCallback(async (att: AttachmentDto) => {
    setDownloadingId(att.attachmentId);
    const url = att.downloadUrl.replace(/"/g, "%22").replace(/ /g, "%20");
    const destination = new Directory(Paths.cache, 'Buatin')
    try {

      if (!(await destination.exists)) {
        await destination.create();
      }
      // Extract base name and extension
      const fileName = att.fileName || 'file';
      const dotIndex = fileName.lastIndexOf('.');
      const base = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
      const ext = dotIndex !== -1 ? fileName.substring(dotIndex) : '';

      // Function to check for duplicate and generate next available name
      let counter = 0;
      let uniqueName = fileName;
      let targetFile = new File(destination, uniqueName);

      while (await targetFile.exists) {
        counter++;
        uniqueName = `${base} (${counter})${ext}`;
        targetFile = new File(destination, uniqueName);
      }
      const output = await File.downloadFileAsync(url, targetFile);
      if (Platform.OS == 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert("Permission denied", "You must choose a folder to save the file.");
          setDownloadingId(null)
          return;
        }
        // Copy the downloaded file into the user-picked folder via SAF
        try {
          // Read downloaded file as Base64
          const base64 = await FileSystem.readAsStringAsync(output.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Create the destination file (use your resolved uniqueName + mime type)
          const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,           // folder picked in the system picker
            uniqueName,                         // e.g. "report (2).pdf"
            att.mimeType || "application/octet-stream"
          );

          // Write content
          await FileSystem.writeAsStringAsync(destUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert("Saved", `File saved to the selected folder as "${uniqueName}".`);
        } catch (e) {
          console.error("SAF write failed:", e);
          Alert.alert("Save error", String(e));
        }
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(output.uri, {
          mimeType: att.mimeType,
          dialogTitle: att.fileName,
        });
      }
    } catch (error) {
      console.error(error);
    }
    setDownloadingId(null);
  }, []);

  return { downloadingId, downloadAttachment };
};
