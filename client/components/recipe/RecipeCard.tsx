import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Recipe } from '../../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(recipe)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {recipe.summary}
        </Text>

        <View style={styles.metaInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{recipe.cookingTime} min</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Serves</Text>
            <Text style={styles.infoValue}>{recipe.servings}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Difficulty</Text>
            <Text
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(recipe.difficulty) }
              ]}
            >
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  difficultyBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});