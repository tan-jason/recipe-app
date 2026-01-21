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
import { mockRecipes } from '@/types/mockData';
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
        // Fallback to mock data
        setRecipes(mockRecipes.slice(0, 5));
      }
    } else {
      // Use mock data if no API data provided
      setRecipes(mockRecipes.slice(0, 5));
    }
  }, [recipesData]);

  const handleRecipePress = (recipe: Recipe) => {
    router.push({
      pathname: '/recipe-detail',
      params: { id: recipe.id }
    });
  };

  const handleRefreshRecipes = async () => {
    if (!lastImageUri && !recipesData) {
      // If we don't have the original image, use mock shuffle
      setLoading(true);
      setTimeout(() => {
        const currentIds = recipes.map(r => r.id);
        const availableRecipes = mockRecipes.filter(r => !currentIds.includes(r.id));

        if (availableRecipes.length >= 5) {
          setRecipes(availableRecipes.slice(0, 5));
        } else {
          const shuffled = [...mockRecipes].sort(() => Math.random() - 0.5);
          setRecipes(shuffled.slice(0, 5));
        }
        setLoading(false);
      }, 1000);
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
        // Use the ingredients from the original API call
        // This is a fallback - ideally we'd store the original image URI
        setTimeout(() => {
          const shuffled = [...mockRecipes].sort(() => Math.random() - 0.5);
          setRecipes(shuffled.slice(0, 5));
          setLoading(false);
        }, 1000);
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
        <Text style={styles.subtitle}>5 suggestions</Text>
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