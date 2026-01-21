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
import LoadingSpinner from '@/components/LoadingSpinner';
import { Recipe, RecipeGenerationResponse } from '@/types/recipe';
import { recipeService } from '@/services/recipeService';

const MAX_REFRESH_LIMIT = 10

export default function GeneratedRecipesScreen() {
  const router = useRouter();
  const { recipesData } = useLocalSearchParams<{ recipesData?: string }>();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [allGeneratedTitles, setAllGeneratedTitles] = useState<string[]>([]);
  const [refreshCount, setRefreshCount] = useState<number>(1);

  // Load initial data from navigation params
  useEffect(() => {
    if (recipesData) {
      try {
        const data: RecipeGenerationResponse = JSON.parse(recipesData);
        setRecipes(data.recipes);
        setIdentifiedIngredients(data.identifiedIngredients);
        // Store initial recipe titles for exclusion tracking
        setAllGeneratedTitles(data.recipes.map(r => r.title));
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
    if (refreshCount >= MAX_REFRESH_LIMIT) {
      Alert.alert(
        'Refresh Limit Reached',
        "You've seen 50 recipes! Take a new photo for more ideas.",
        [{ text: 'Take Photo', onPress: () => router.push('/') }]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await recipeService.regenerateRecipes({
        ingredients: identifiedIngredients,
        excludeTitles: allGeneratedTitles,
      });

      // Update state with new recipes
      const newTitles = response.recipes.map(r => r.title);
      setAllGeneratedTitles(prev => [...prev, ...newTitles]);
      setRefreshCount(prev => prev + 1);
      setRecipes(response.recipes);
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="lg" color="primary" />
            <Text style={styles.loadingText}>Getting new recipes...</Text>
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recipeList}
          />
        )}

        <TouchableOpacity
          style={[
            styles.newRecipesButton,
            loading && styles.newRecipesButtonLoading,
            refreshCount >= MAX_REFRESH_LIMIT && styles.newRecipesButtonDisabled
          ]}
          onPress={handleRefreshRecipes}
          disabled={loading || refreshCount >= MAX_REFRESH_LIMIT}
        >
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.newRecipesButtonText}>
            {refreshCount >= MAX_REFRESH_LIMIT ? 'Limit reached' : 'New recipes'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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
  newRecipesButtonLoading: {
    backgroundColor: '#71717a',
  },
  newRecipesButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  newRecipesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});