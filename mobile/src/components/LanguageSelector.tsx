/**
 * LanguageSelector Component
 * Language selection component for internationalization
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

import { useTranslation } from '../hooks/useTranslation';
import { SupportedLanguage, LanguageInfo } from '../services/i18nService';
import { theme } from '../utils/theme';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
  onLanguageChange,
  style,
}) => {
  const { t, currentLanguage, setLanguage, supportedLanguages } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageSelect = async (language: SupportedLanguage) => {
    if (language === currentLanguage || isChanging) return;

    try {
      setIsChanging(true);
      
      // Change language
      setLanguage(language);
      
      // Notify parent component
      if (onLanguageChange) {
        onLanguageChange(language);
      }

      // Close modal after short delay for feedback
      setTimeout(() => {
        onClose();
        setIsChanging(false);
      }, 500);
    } catch (error) {
      console.error('Failed to change language:', error);
      setIsChanging(false);
    }
  };

  const renderLanguageItem = (languageInfo: LanguageInfo, index: number) => {
    const isSelected = languageInfo.code === currentLanguage;
    const isBeingChanged = isChanging && isSelected;

    return (
      <Animatable.View
        key={languageInfo.code}
        animation="fadeInUp"
        delay={index * 100}
      >
        <TouchableOpacity
          style={[
            styles.languageItem,
            isSelected && styles.selectedLanguageItem,
            isBeingChanged && styles.changingLanguageItem,
          ]}
          onPress={() => handleLanguageSelect(languageInfo.code)}
          disabled={isChanging}
          activeOpacity={0.7}
        >
          <View style={styles.languageContent}>
            <Text style={styles.languageFlag}>{languageInfo.flag}</Text>
            
            <View style={styles.languageInfo}>
              <Text style={[
                styles.languageName,
                isSelected && styles.selectedLanguageName,
              ]}>
                {languageInfo.name}
              </Text>
              <Text style={[
                styles.languageNativeName,
                isSelected && styles.selectedLanguageNativeName,
              ]}>
                {languageInfo.nativeName}
              </Text>
            </View>

            <View style={styles.languageActions}>
              {isSelected && (
                <Icon 
                  name="check-circle" 
                  size={24} 
                  color={theme.colors.success} 
                />
              )}
              {isBeingChanged && (
                <Icon 
                  name="sync" 
                  size={24} 
                  color={theme.colors.primary} 
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            disabled={isChanging}
          />
          <Text style={styles.headerTitle}>{t('settings.language')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Divider />

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoHeader}>
                <Icon name="language" size={24} color={theme.colors.primary} />
                <Text style={styles.infoTitle}>
                  {t('settings.language')}
                </Text>
              </View>
              <Text style={styles.infoDescription}>
                Choose your preferred language for the app interface
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.languageList}>
            <Text style={styles.sectionTitle}>Available Languages</Text>
            
            {supportedLanguages.map((languageInfo, index) => 
              renderLanguageItem(languageInfo, index)
            )}
          </View>

          {/* Current Language Info */}
          <Card style={styles.currentLanguageCard}>
            <Card.Content>
              <View style={styles.currentLanguageHeader}>
                <Icon name="check-circle" size={20} color={theme.colors.success} />
                <Text style={styles.currentLanguageTitle}>
                  Current Language
                </Text>
              </View>
              <View style={styles.currentLanguageInfo}>
                <Text style={styles.currentLanguageFlag}>
                  {supportedLanguages.find(lang => lang.code === currentLanguage)?.flag}
                </Text>
                <Text style={styles.currentLanguageText}>
                  {supportedLanguages.find(lang => lang.code === currentLanguage)?.nativeName}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={onClose}
            disabled={isChanging}
            style={styles.doneButton}
            contentStyle={styles.doneButtonContent}
          >
            {t('common.done')}
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48, // Same width as IconButton
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 24,
    borderRadius: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginLeft: 12,
  },
  infoDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onBackground,
    marginBottom: 16,
  },
  languageList: {
    marginBottom: 24,
  },
  languageItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  selectedLanguageItem: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  changingLanguageItem: {
    opacity: 0.7,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: theme.colors.primary,
  },
  languageNativeName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  selectedLanguageNativeName: {
    color: theme.colors.primary,
  },
  languageActions: {
    width: 32,
    alignItems: 'center',
  },
  currentLanguageCard: {
    borderRadius: 12,
    backgroundColor: theme.colors.success + '10',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  currentLanguageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentLanguageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
    marginLeft: 8,
  },
  currentLanguageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLanguageFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  currentLanguageText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  bottomSpacer: {
    height: 32,
  },
  footer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  doneButton: {
    borderRadius: 8,
  },
  doneButtonContent: {
    paddingVertical: 8,
  },
});

export default LanguageSelector;