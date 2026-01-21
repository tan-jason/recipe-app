import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Recipe, RecipeGenerationResponse } from '@/types/recipe';
import { recipeService } from '@/services/recipeService';

export default function GeneratedRecipesScreen() {
  const router = useRouter();
  const { recipesData } = useLocalSearchParams<{ recipesData?: string }>();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastImageUri, setLastImageUri] = useState<string>('');

  // Load initial data from navigation params
  useEffect(() => {
    if (recipesData) {
      try {
        const data: RecipeGenerationResponse = JSON.parse(recipesData);
        setRecipes(data.recipes);
        setIdentifiedIngredients(data.identifiedIngredients);
      } catch (error) {
        console.error('Error parsing recipes data:', error);
        Alert.alert(
          'Error',
          'Failed to load recipes. Please try taking a new photo.',
          [{ text: 'OK', onPress: () => router.push('/') }]
        );
      }
    } else {
      router.push('/');
    }
  }, [recipesData]);

  const handleRecipePress = (recipe: Recipe) => {
    router.push({
      pathname: '/recipe-detail',
      params: {
        id: recipe.id,
        recipeData: JSON.stringify(recipe)
      }
    });
  };

  const handleRefreshRecipes = async () => {
    if (!lastImageUri && !recipesData) {
      Alert.alert(
        'No Photo Available',
        'To generate new recipes, please take a new photo of ingredients.',
        [{ text: 'Take Photo', onPress: () => router.push('/') }]
      );
      return;
    }

    setLoading(true);
    try {
      // Generate new recipes excluding current ones
      const currentIds = recipes.map(r => r.id);

      if (lastImageUri) {
        const response = await recipeService.generateRecipes({
          imageUri: lastImageUri,
          excludeRecipeIds: currentIds,
        });
        setRecipes(response.recipes);
      } else {
        Alert.alert(
          'Unable to Refresh',
          'Please take a new photo to generate different recipes.',
          [{ text: 'Take Photo', onPress: () => router.push('/') }]
        );
        return;
      }
    } catch (error) {
      console.error('Error refreshing recipes:', error);
      Alert.alert(
        'Refresh Failed',
        'Unable to generate new recipes. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCamera = () => {
    router.push('/');
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard recipe={item} onPress={handleRecipePress} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToCamera}>
          <Ionicons name="arrow-back-outline" size={16} color="#6b7280" style={{marginTop: 2}} />
          <Text style={styles.backButtonText}>New search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Recipes</Text>
      </View>

      <View style={styles.recipesSection}>
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.recipeList}
        />

        <TouchableOpacity
          style={styles.newRecipesButton}
          onPress={handleRefreshRecipes}
          disabled={loading}
        >
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.newRecipesButtonText}>
            {loading ? 'Getting new recipes...' : 'New recipes'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
  },
  recipesSection: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f3f4f6'
  },
  recipeList: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  newRecipesButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  newRecipesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});