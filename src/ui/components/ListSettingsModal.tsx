import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { List } from '../../classes/List';
import { useColors } from '../../contexts/ColorContext';

// Define type for sort order
type SortOrderType = "date-first" | "date-last" | "alphabetical" | "manual";

// Define props interface for the dropdown component
interface SortOrderDropdownProps {
  value: SortOrderType;
  onChange: (value: SortOrderType) => void;
  isOpen: boolean;
  toggleOpen: () => void;
  colors: any;
}

// Dropdown component for sort order
const SortOrderDropdown: React.FC<SortOrderDropdownProps> = ({ value, onChange, isOpen, toggleOpen, colors }) => {
  const options: SortOrderType[] = ["date-first", "date-last", "alphabetical", "manual"];
  
  return (
    <View style={[styles.dropdownContainer, { borderColor: colors.divider }]}>
      <TouchableOpacity 
        style={[styles.dropdownHeader, { backgroundColor: colors.backgroundSecondary }]} 
        onPress={toggleOpen}
      >
        <Text style={[styles.dropdownHeaderText, { color: colors.textPrimary }]}>Sort: {value}</Text>
        <Icon 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={colors.iconSecondary}
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.dropdownOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                { borderBottomColor: colors.divider },
                value === option && [styles.dropdownOptionSelected, { backgroundColor: colors.backgroundTertiary }]
              ]}
              onPress={() => {
                onChange(option);
                toggleOpen();
              }}
            >
              <Text 
                style={[
                  styles.dropdownOptionText,
                  { color: colors.textSecondary },
                  value === option && [styles.dropdownOptionTextSelected, { color: colors.primary }]
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

interface ListSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  list: List;
  onSave: (updates: Partial<List>) => void;
  isOwner: boolean;
}

const ListSettingsModal: React.FC<ListSettingsModalProps> = ({
  visible,
  onClose,
  list,
  onSave,
  isOwner,
}) => {
  const { colors } = useColors();
  const [isSortOrderOpen, setIsSortOrderOpen] = useState(false);
  
  // Local state for immediate feedback
  const [localSettings, setLocalSettings] = useState({
    isPublic: list.isPublic,
    today: list.today,
    notifyOnNew: list.notifyOnNew,
    sortOrder: list.sortOrder as SortOrderType,
  });

  // Update local state when modal opens or list changes
  useEffect(() => {
    setLocalSettings({
      isPublic: list.isPublic,
      today: list.today,
      notifyOnNew: list.notifyOnNew,
      sortOrder: list.sortOrder as SortOrderType,
    });
  }, [visible, list]);

  // Owner settings section
  const renderOwnerSettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>List Settings</Text>
      <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Public</Text>
        <Switch
          value={localSettings.isPublic}
          onValueChange={(value) => {
            setLocalSettings(prev => ({ ...prev, isPublic: value }));
            onSave({ isPublic: value });
          }}
          trackColor={{ false: colors.backgroundSecondary, true: `${colors.primary}80` }}
          thumbColor={localSettings.isPublic ? colors.primary : colors.backgroundTertiary}
        />
      </View>
      <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Description</Text>
        <Text style={[styles.settingValue, { color: colors.textSecondary }]} numberOfLines={2}>
          {list.description || 'No description'}
        </Text>
      </View>
      <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Cover Image</Text>
        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
          {list.coverImageURL ? 'Has cover image' : 'No cover image'}
        </Text>
      </View>
    </View>
  );

  // Library settings section
  const renderLibrarySettings = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Library Settings</Text>
      <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Today</Text>
        <Switch
          value={localSettings.today}
          onValueChange={(value) => {
            setLocalSettings(prev => ({ ...prev, today: value }));
            onSave({ today: value });
          }}
          trackColor={{ false: colors.backgroundSecondary, true: `${colors.primary}80` }}
          thumbColor={localSettings.today ? colors.primary : colors.backgroundTertiary}
        />
      </View>
      <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Notify on new</Text>
        <Switch
          value={localSettings.notifyOnNew}
          onValueChange={(value) => {
            setLocalSettings(prev => ({ ...prev, notifyOnNew: value }));
            onSave({ notifyOnNew: value });
          }}
          trackColor={{ false: colors.backgroundSecondary, true: `${colors.primary}80` }}
          thumbColor={localSettings.notifyOnNew ? colors.primary : colors.backgroundTertiary}
        />
      </View>
      <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Sort Order</Text>
        <SortOrderDropdown
          value={localSettings.sortOrder}
          onChange={(value) => {
            setLocalSettings(prev => ({ ...prev, sortOrder: value }));
            onSave({ sortOrder: value });
          }}
          isOpen={isSortOrderOpen}
          toggleOpen={() => setIsSortOrderOpen(!isSortOrderOpen)}
          colors={colors}
        />
      </View>
      {localSettings.notifyOnNew && (
        <>
          <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Notify Time</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {list.notifyTime ? new Date(list.notifyTime).toLocaleTimeString() : 'Not set'}
            </Text>
          </View>
          <View style={[styles.settingRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Notify Days</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {list.notifyDays || 'Not set'}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>List Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.iconPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {isOwner && renderOwnerSettings()}
            {renderLibrarySettings()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    marginLeft: 16,
  },
  dropdownContainer: {
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  dropdownHeaderText: {
    fontSize: 16,
  },
  dropdownOptions: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
  },
  dropdownOptionSelected: {
    // Background color is set dynamically
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  dropdownOptionTextSelected: {
    fontWeight: '600',
  },
});

export default ListSettingsModal; 