import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { mockRecipes } from '@/types/mockData';
import { Recipe } from '@/types/recipe';

export default function GeneratedRecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes.slice(0, 5));
  const [loading, setLoading] = useState(false);

  const handleRecipePress = (recipe: Recipe) => {
    router.push({
      pathname: '/recipe-detail',
      params: { id: recipe.id }
    });
  };

  const handleRefreshRecipes = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // Get 5 different recipes (excluding current ones)
      const currentIds = recipes.map(r => r.id);
      const availableRecipes = mockRecipes.filter(r => !currentIds.includes(r.id));

      if (availableRecipes.length >= 5) {
        setRecipes(availableRecipes.slice(0, 5));
      } else {
        // If not enough different recipes, shuffle all recipes
        const shuffled = [...mockRecipes].sort(() => Math.random() - 0.5);
        setRecipes(shuffled.slice(0, 5));
      }
      setLoading(false);
    }, 1000);
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