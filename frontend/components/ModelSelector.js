import { View, StyleSheet, FlatList } from "react-native"
import { Portal, Modal, Card, Title, Text, RadioButton, Divider } from "react-native-paper"
import { theme } from "../theme"

const ModelSelector = ({ visible, onDismiss, models, selectedModelId, onSelect }) => {
  const renderModelItem = ({ item }) => (
    <View>
      <RadioButton.Item
        label={
          <View style={styles.modelItemContent}>
            <Text style={styles.modelName}>{item.name}</Text>
            <Text style={styles.modelDescription}>{item.description}</Text>
            {item.supportsImage && (
              <View style={styles.imageSupport}>
                <Text style={styles.imageSupportText}>Supports Images</Text>
              </View>
            )}
          </View>
        }
        value={item.id}
        status={selectedModelId === item.id ? "checked" : "unchecked"}
        onPress={() => onSelect(item.id)}
        color={theme.colors.primary}
        style={styles.radioItem}
      />
      <Divider />
    </View>
  )

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Select AI Model</Title>
            <FlatList
              data={models}
              renderItem={renderModelItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    margin: 20,
  },
  card: {
    borderRadius: 12,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    paddingBottom: 8,
  },
  radioItem: {
    paddingVertical: 12,
  },
  modelItemContent: {
    flex: 1,
    marginLeft: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  imageSupport: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  imageSupportText: {
    fontSize: 12,
    color: "#1565c0",
  },
})

export default ModelSelector
