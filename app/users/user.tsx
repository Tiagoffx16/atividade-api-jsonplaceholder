/** @jsxImportSource react */
/** @tsx */
import { User } from "@/types/users";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}

// Tipagem estendida localmente (não altera types compartilhados)
type ExtendedUser = User & {
  phone?: string;
  website?: string;
  company?: { name?: string; catchPhrase?: string; bs?: string } | null;
};

async function getUserById(id: number): Promise<ExtendedUser> {
  const resp = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!resp.ok) throw new Error("Falha ao buscar usuário");
  return (await resp.json()) as ExtendedUser;
}

async function deleteUser(id: number): Promise<void> {
  const resp = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    method: "DELETE",
  });
  if (!resp.ok && resp.status !== 200 && resp.status !== 204) {
    throw new Error("Falha ao deletar usuário");
  }
}

export default function UserDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await getUserById(Number(id));
        setUser(response);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja deletar ${user?.name}?`,
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Deletar",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteUser(Number(id));
              Alert.alert("Sucesso", "Usuário deletado com sucesso!");
              router.back();
            } catch (error) {
              console.error("Erro ao deletar usuário:", error);
              Alert.alert("Erro", "Não foi possível deletar o usuário.");
            } finally {
              setIsDeleting(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/users/form?id=${id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-600">Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Usuário não encontrado.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header com botões de ação */}
      <View className="flex-row justify-between items-center bg-blue-500 px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1 ml-4">Detalhes do Usuário</Text>
        <TouchableOpacity onPress={handleEdit} className="ml-2">
          <Ionicons name="pencil" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} disabled={isDeleting} className="ml-2">
          <Ionicons name="trash" size={24} color={isDeleting ? "#999" : "white"} />
        </TouchableOpacity>
      </View>

      {/* Informações básicas */}
      <View className="px-4 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">{user.name}</Text>
        <Text className="text-sm text-gray-500 mt-1">@{user.username}</Text>
      </View>

      {/* Seção de Contato */}
      <View className="px-4 py-4 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">Contato</Text>
        
        <View className="mb-3">
          <Text className="text-sm text-gray-600 font-semibold">Email</Text>
          <Text className="text-base text-gray-800 mt-1">{user.email}</Text>
        </View>

        {user.phone && (
          <View className="mb-3">
            <Text className="text-sm text-gray-600 font-semibold">Telefone</Text>
            <Text className="text-base text-gray-800 mt-1">{user.phone}</Text>
          </View>
        )}

        {user.website && (
          <View>
            <Text className="text-sm text-gray-600 font-semibold">Website</Text>
            <Text className="text-base text-blue-600 mt-1">{user.website}</Text>
          </View>
        )}
      </View>

      {/* Seção de Endereço */}
      <View className="px-4 py-4 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-800 mb-3">Endereço</Text>
        
        <View className="mb-2">
          <Text className="text-sm text-gray-600 font-semibold">Rua</Text>
          <Text className="text-base text-gray-800 mt-1">{user.address.street}</Text>
        </View>

        {user.address.suite && (
          <View className="mb-2">
            <Text className="text-sm text-gray-600 font-semibold">Apto/Sala</Text>
            <Text className="text-base text-gray-800 mt-1">{user.address.suite}</Text>
          </View>
        )}

        <View className="mb-2">
          <Text className="text-sm text-gray-600 font-semibold">Cidade</Text>
          <Text className="text-base text-gray-800 mt-1">{user.address.city}</Text>
        </View>

        <View className="mb-2">
          <Text className="text-sm text-gray-600 font-semibold">CEP</Text>
          <Text className="text-base text-gray-800 mt-1">{user.address.zipcode}</Text>
        </View>

        {user.address.geo && (
          <View>
            <Text className="text-sm text-gray-600 font-semibold">Coordenadas</Text>
            <Text className="text-base text-gray-800 mt-1">
              Lat: {user.address.geo.lat} | Lng: {user.address.geo.lng}
            </Text>
          </View>
        )}
      </View>

      {/* Seção de Empresa */}
      {user.company && (
        <View className="px-4 py-4 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-800 mb-3">Empresa</Text>
          
          <View className="mb-2">
            <Text className="text-sm text-gray-600 font-semibold">Nome</Text>
            <Text className="text-base text-gray-800 mt-1">{user.company.name}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-sm text-gray-600 font-semibold">Slogan</Text>
            <Text className="text-base text-gray-800 mt-1 italic">{user.company.catchPhrase}</Text>
          </View>

          <View>
            <Text className="text-sm text-gray-600 font-semibold">Foco</Text>
            <Text className="text-base text-gray-800 mt-1">{user.company.bs}</Text>
          </View>
        </View>
      )}

      {/* Botões de ação */}
      <View className="px-4 py-6 flex-row gap-3">
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-1 bg-blue-500 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-bold text-base">Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          disabled={isDeleting}
          className="flex-1 bg-red-500 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-bold text-base">
            {isDeleting ? "Deletando..." : "Deletar"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


