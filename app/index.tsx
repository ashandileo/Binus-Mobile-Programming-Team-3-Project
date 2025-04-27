import { ScrollView, TouchableOpacity, View } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Text, Card, FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import { Image } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

interface Survey {
  id: string;
  street: string;
  description: string;
  lokasi: string;
  tanggal: string;
  image: string;
  category?: string;
}

export default function Index() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const result = await db.getAllAsync<Survey>(
        "SELECT * FROM surveys ORDER BY id DESC"
      );
      setSurveys(result);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const [day, month, year] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "in the future";
    } else if (diffDays === 0) {
      return "today";
    } else if (diffDays === 1) {
      return "yesterday";
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? "year" : "years"} ago`;
    }
  };

  const formatDate = (dateString: string) => {
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

  const handleCardPress = (id: string) => {
    router.push(`/detail/${id}`);
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: "PublicFix",
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <ScrollView className="p-4">
        {surveys.map((item) => (
          <View key={item.id} className="mb-6">
            <TouchableOpacity
              onPress={() => handleCardPress(item.id)}
              activeOpacity={0.7}
            >
              <Card>
                <Card.Content className="flex-row gap-4 ">
                  <Image
                    source={{ uri: item.image || "https://picsum.photos/700" }}
                    style={{ width: 100, height: 100, borderRadius: 8 }}
                  />
                  <View className="flex-1 justify-between">
                    <View className="flex-row items-center justify-between">
                      <Text
                        variant="titleMedium"
                        style={{ fontWeight: "bold" }}
                      >
                        {item.street}
                      </Text>
                      <Text variant="labelMedium">
                        {formatDate(item.tanggal)}
                      </Text>
                    </View>
                    <Text variant="bodyMedium">{item.description}</Text>
                    <Text variant="labelSmall">{item.lokasi}</Text>
                    <Text variant="labelSmall">{getTimeAgo(item.tanggal)}</Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </View>
        ))}
        <View className="h-20" />
      </ScrollView>
      <FAB
        icon="plus"
        onPress={() => router.push("/create")}
        className="absolute m-4 right-0 bottom-0 bg-blue-500 shadow-lg"
        color="white"
        customSize={56}
        animated={true}
      />
    </SafeAreaView>
  );
}
