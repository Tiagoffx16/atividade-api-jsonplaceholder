import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { userService } from '../../services/userService';
import { User } from '../../types/users';
import { useRouter } from 'expo-router';

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este usuário?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteUser(userId);
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
              // Remove o usuário da lista localmente
              setUsers(users.filter(user => user.id !== userId));
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir usuário');
              console.error('Erro ao excluir usuário:', err);
            }
          },
        },
      ],
    );
  };

  const navigateToUserDetails = (user: User) => {
    router.push({
      pathname: '/users/user',
      params: { userId: user.id.toString() }
    });
  };

  const navigateToCreateUser = () => {
    router.push('/users/form');
  };

  const navigateToEditUser = (user: User) => {
    router.push({
      pathname: '/users/form',
      params: { userId: user.id.toString() }
    });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity onPress={() => navigateToUserDetails(item)}>
      <View>
        <Text>Nome: {item.name}</Text>
        <Text>Email: {item.email}</Text>
        <Text>Username: {item.username}</Text>
        
        <View>
          <TouchableOpacity onPress={() => navigateToEditUser(item)}>
            <Text>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
            <Text>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Carregando usuários...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Text>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Text>Lista de Usuários</Text>
      
      <TouchableOpacity onPress={navigateToCreateUser}>
        <Text>Adicionar Novo Usuário</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadUsers}
      />
    </View>
  );
}