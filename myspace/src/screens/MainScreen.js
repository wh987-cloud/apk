import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import BitcoinKeyGenerator from '../utils/BitcoinKeyGenerator';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

const MainScreen = () => {
  const [keyGenerator] = useState(() => new BitcoinKeyGenerator());
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('未选择文件');
  const [stats, setStats] = useState({
    totalGenerated: 0,
    foundKeys: 0,
    speed: 0,
  });
  const [foundKeys, setFoundKeys] = useState([]);
  const [canSave, setCanSave] = useState(false);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      // 组件卸载时停止生成
      keyGenerator.stopGeneration();
    };
  }, [keyGenerator]);

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.plainText],
      });

      const file = result[0];
      const content = await RNFS.readFile(file.uri, 'utf8');
      
      keyGenerator.loadTargetPublicKeys(content);
      setSelectedFileName(file.name);
      
      Alert.alert('成功', `已加载 ${keyGenerator.getTargetPublicKeysCount()} 个目标公钥`);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('错误', '文件加载失败');
      }
    }
  };

  const startGeneration = async () => {
    if (keyGenerator.getTargetPublicKeysCount() === 0) {
      Alert.alert('提示', '请先选择公钥文件');
      return;
    }

    if (isGenerating) return;

    setIsGenerating(true);
    isCancelledRef.current = false;
    setFoundKeys([]);
    setCanSave(false);

    try {
      await keyGenerator.generateKeyPairsUntilTargetFound(
        (newStats) => {
          setStats(newStats);
        },
        (keyPair) => {
          setFoundKeys(prev => [keyPair, ...prev]);
          setCanSave(true);
          Alert.alert('找到目标公钥！', '密钥对已添加到列表中');
        },
        () => isCancelledRef.current
      );
    } catch (error) {
      console.error('生成过程出错:', error);
      Alert.alert('错误', '生成过程出现错误');
    } finally {
      setIsGenerating(false);
    }
  };

  const stopGeneration = () => {
    isCancelledRef.current = true;
    keyGenerator.stopGeneration();
    setIsGenerating(false);
  };

  const saveToFile = async () => {
    if (foundKeys.length === 0) {
      Alert.alert('提示', '没有找到的密钥可保存');
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `found_keys_${timestamp}.txt`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      let content = '比特币密钥生成器 - 找到的密钥对\n';
      content += `生成时间: ${new Date().toLocaleString()}\n`;
      content += `总共找到: ${foundKeys.length} 个密钥对\n`;
      content += '='.repeat(50) + '\n\n';

      foundKeys.forEach((keyPair, index) => {
        const timestamp = new Date(keyPair.timestamp).toLocaleString();
        content += `密钥对 #${index + 1}\n`;
        content += `时间: ${timestamp}\n`;
        content += `私钥: ${keyPair.privateKey}\n`;
        content += `公钥: ${keyPair.publicKey}\n`;
        content += '-'.repeat(30) + '\n\n';
      });

      await RNFS.writeFile(filePath, content, 'utf8');
      Alert.alert('成功', `文件已保存到: ${filePath}`);
    } catch (error) {
      console.error('保存文件失败:', error);
      Alert.alert('错误', '文件保存失败');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 文件选择区域 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>选择公钥文件</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={selectFile}
            disabled={isGenerating}>
            <Text style={styles.buttonText}>选择公钥文件</Text>
          </TouchableOpacity>
          <Text style={styles.fileName}>{selectedFileName}</Text>
        </View>

        {/* 控制按钮区域 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>生成状态</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.startButton, isGenerating && styles.disabledButton]}
              onPress={startGeneration}
              disabled={isGenerating}>
              <Text style={styles.buttonText}>开始生成</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.stopButton, !isGenerating && styles.disabledButton]}
              onPress={stopGeneration}
              disabled={!isGenerating}>
              <Text style={styles.buttonText}>停止生成</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.status, isGenerating ? styles.statusRunning : styles.statusStopped]}>
            {isGenerating ? '生成中...' : '已停止'}
          </Text>
        </View>

        {/* 统计信息区域 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>统计信息</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>总生成数:</Text>
            <Text style={styles.statsValue}>{formatNumber(stats.totalGenerated)}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>找到密钥数:</Text>
            <Text style={styles.statsValue}>{stats.foundKeys}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>生成速度:</Text>
            <Text style={styles.statsValue}>{stats.speed.toFixed(1)} 密钥/秒</Text>
          </View>
        </View>

        {/* 找到的密钥区域 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>找到的密钥</Text>
          <ScrollView style={styles.keysContainer} nestedScrollEnabled>
            {foundKeys.length === 0 ? (
              <Text style={styles.noKeysText}>暂无找到的密钥</Text>
            ) : (
              foundKeys.map((keyPair, index) => (
                <View key={index} style={styles.keyItem}>
                  <Text style={styles.keyTitle}>密钥对 #{index + 1}</Text>
                  <Text style={styles.keyTime}>
                    时间: {new Date(keyPair.timestamp).toLocaleString()}
                  </Text>
                  <Text style={styles.keyText}>私钥: {keyPair.privateKey}</Text>
                  <Text style={styles.keyText}>公钥: {keyPair.publicKey}</Text>
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, !canSave && styles.disabledButton]}
            onPress={saveToFile}
            disabled={!canSave}>
            <Text style={styles.buttonText}>保存到文件</Text>
          </TouchableOpacity>
        </View>

        {/* 加载指示器 */}
        {isGenerating && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={styles.loadingText}>正在生成密钥...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  startButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#F44336',
  },
  disabledButton: {
    opacity: 0.5,
  },
  fileName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusRunning: {
    color: '#4CAF50',
  },
  statusStopped: {
    color: '#F44336',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statsValue: {
    fontSize: 16,
    color: '#6200EE',
    fontWeight: 'bold',
  },
  keysContainer: {
    maxHeight: 200,
    marginBottom: 12,
  },
  noKeysText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  keyItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  keyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  keyTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  keyText: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default MainScreen; 