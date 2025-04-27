import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Text, TextInput, IconButton, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import * as React from "react";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";

const OPTIONS = [
  { label: "Jalan Berlubang", value: "pothole" },
  { label: "Aspal Retak", value: "cracks" },
  { label: "Permukaan Tidak Rata", value: "uneven" },
  { label: "Bahu Jalan Rusak", value: "shoulder" },
  { label: "Drainase Tersumbat", value: "drainage" },
  { label: "Trotoar Rusak", value: "sidewalk" },
  { label: "Lampu Jalan Tidak Berfungsi", value: "streetlight" },
  { label: "Rambu Lalu Lintas Rusak", value: "trafficsign" },
  { label: "Jembatan Rusak", value: "bridge" },
  { label: "Longsor", value: "landslide" },
];

export default function Create() {
  const router = useRouter();
  const db = useSQLiteContext();

  // Form state
  const [street, setStreet] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [lokasi, setLokasi] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Dropdown state
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(null);
  const [items, setItems] = React.useState(OPTIONS);

  // Image state
  const [image, setImage] = React.useState<string | null>(null);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      } else {
        console.log("No image selected or picker was canceled");
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!street.trim()) {
      alert("Masukkan nama jalan");
      return;
    }

    if (!description.trim()) {
      alert("Masukkan deskripsi kerusakan");
      return;
    }

    if (!lokasi.trim()) {
      alert("Masukkan lokasi");
      return;
    }

    if (!value) {
      alert("Pilih kategori kerusakan");
      return;
    }

    if (!image) {
      alert("Unggah foto kerusakan");
      return;
    }

    try {
      setLoading(true);

      // Get current date in DD-MM-YYYY format
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      // Insert data into database
      await db.runAsync(
        `INSERT INTO surveys (street, description, lokasi, tanggal, image, category) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [street, description, lokasi, formattedDate, image, value]
      );

      alert("Laporan berhasil disimpan");
      router.replace("/"); // Navigate back to home screen
    } catch (error) {
      console.error("Error saving survey:", error);
      alert("Gagal menyimpan laporan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: "Buat Laporan",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 p-4">
          {/* Image Upload Section */}
          <Text
            variant="titleMedium"
            className="mb-2"
            style={{ fontWeight: "bold" }}
          >
            Foto
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            className="h-48 border-2 border-dashed border-gray-300 rounded-lg mb-4 items-center justify-center"
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <IconButton icon="camera" size={40} />
                <Text>Unggah foto dari galeri kamu</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Form Fields */}
          <View className="mb-4">
            <Text
              variant="titleMedium"
              className="mb-2"
              style={{ fontWeight: "bold" }}
            >
              Nama Jalan
            </Text>
            <TextInput
              placeholder="Masukkan nama jalan"
              value={street}
              onChangeText={setStreet}
              mode="outlined"
            />
          </View>

          <View className="mb-4">
            <Text
              variant="titleMedium"
              className="mb-2"
              style={{ fontWeight: "bold" }}
            >
              Deskripsi
            </Text>
            <TextInput
              placeholder="Ceritakan laporan disini..."
              placeholderTextColor="#999999"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline={true}
              numberOfLines={3}
              style={{ minHeight: 80 }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="mt-4"
            />
          </View>

          <View className="mb-4">
            <Text
              variant="titleMedium"
              className="mb-2"
              style={{ fontWeight: "bold" }}
            >
              Lokasi
            </Text>
            <TextInput
              placeholder="Masukkan kota atau kabupaten"
              value={lokasi}
              onChangeText={setLokasi}
              mode="outlined"
            />
          </View>

          {/* Category Dropdown with zIndex */}
          <View className="mb-4">
            <Text
              variant="titleMedium"
              className="mb-2"
              style={{ fontWeight: "bold" }}
            >
              Kategori
            </Text>
            <View style={{ zIndex: 2000 }}>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder="Pilih Kategori"
                style={{ borderColor: "#e0e0e0" }}
                zIndex={1000}
                zIndexInverse={3000}
              />
            </View>
          </View>

          {/* Submit Button */}
          <View style={{ marginTop: "auto", paddingVertical: 16 }}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              className="py-2 bg-blue-500"
            >
              Simpan Laporan
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
