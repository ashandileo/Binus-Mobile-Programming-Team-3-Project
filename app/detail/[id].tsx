import { View, Image, ScrollView } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Text, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";

interface Survey {
  id: string;
  street: string;
  description: string;
  lokasi: string;
  tanggal: string;
  image: string;
  category: string;
}

// Map category values to their labels
const CATEGORY_LABELS: Record<string, string> = {
  pothole: "Jalan Berlubang",
  cracks: "Aspal Retak",
  uneven: "Permukaan Tidak Rata",
  shoulder: "Bahu Jalan Rusak",
  drainage: "Drainase Tersumbat",
  sidewalk: "Trotoar Rusak",
  streetlight: "Lampu Jalan Tidak Berfungsi",
  trafficsign: "Rambu Lalu Lintas Rusak",
  bridge: "Jembatan Rusak",
  landslide: "Longsor",
};

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      // Ensure id is properly handled as a string
      const surveyId = Array.isArray(id) ? id[0] : id;
      const result = await db.getFirstAsync<Survey>(
        "SELECT * FROM surveys WHERE id = ?",
        [surveyId]
      );
      setSurvey(result);
    } catch (error) {
      console.error("Error fetching survey details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const [day, month, year] = dateString.split("-").map(Number);

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const monthName = monthNames[month - 1];
    return `${day} ${monthName} ${year}`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!survey) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Laporan tidak ditemukan</Text>
        <Button mode="contained" onPress={() => router.back()} className="mt-4">
          Kembali
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: survey.street,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <ScrollView className="flex-1">
        {/* Image Section */}
        <View className="w-full h-64">
          <Image
            source={{ uri: survey.image || "https://picsum.photos/700" }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Details Section */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              {survey.street}
            </Text>
            <Text variant="bodyMedium">{formatDate(survey.tanggal)}</Text>
          </View>

          {/* Category */}
          <View className="bg-blue-100 self-start rounded-full px-3 py-1 mb-4">
            <Text variant="labelMedium" className="text-blue-700">
              {CATEGORY_LABELS[survey.category] || survey.category}
            </Text>
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-4">
            <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
              Lokasi:
            </Text>
            <Text variant="bodyMedium" className="ml-2">
              {survey.lokasi}
            </Text>
          </View>

          {/* Description */}
          <Text
            variant="titleSmall"
            style={{ fontWeight: "bold", marginBottom: 8 }}
          >
            Deskripsi Kerusakan:
          </Text>
          <Text variant="bodyMedium" className="mb-4">
            {survey.description}
          </Text>

          {/* Back Button */}
          <Button
            mode="contained"
            onPress={() => router.back()}
            className="mt-4 bg-blue-500"
          >
            Kembali
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
