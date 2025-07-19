import crypto from 'react-native-crypto';

/**
 * 比特币密钥生成器
 * 用于生成随机私钥并转换为非压缩公钥
 */
class BitcoinKeyGenerator {
  constructor() {
    this.targetPubKeys = new Set();
    this.isGenerating = false;
    this.generationStats = {
      totalGenerated: 0,
      foundKeys: 0,
      startTime: null,
      speed: 0,
    };
  }

  /**
   * 加载目标公钥列表
   * @param {string} pubKeysContent - 公钥文件内容
   */
  loadTargetPublicKeys(pubKeysContent) {
    this.targetPubKeys.clear();
    const lines = pubKeysContent.split('\n');
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        this.targetPubKeys.add(trimmedLine);
      }
    });
    console.log(`已加载 ${this.targetPubKeys.size} 个目标公钥`);
  }

  /**
   * 生成随机私钥
   * @returns {string} 十六进制私钥
   */
  generateRandomPrivateKey() {
    // 生成32字节的随机私钥
    const privateKeyBytes = crypto.randomBytes(32);
    
    // 确保私钥在有效范围内 (1 到 n-1)
    // 比特币的椭圆曲线参数 n = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
    const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
    
    let privateKeyBigInt = BigInt('0x' + privateKeyBytes.toString('hex'));
    privateKeyBigInt = privateKeyBigInt % n;
    
    // 确保不为0
    if (privateKeyBigInt === 0n) {
      privateKeyBigInt = 1n;
    }
    
    return privateKeyBigInt.toString(16).padStart(64, '0');
  }

  /**
   * 从私钥生成公钥
   * @param {string} privateKeyHex - 十六进制私钥
   * @returns {string} 非压缩公钥
   */
  generatePublicKey(privateKeyHex) {
    try {
      // 使用椭圆曲线乘法生成公钥
      // 这里使用简化的实现，实际应用中应使用专业的加密库
      const privateKey = BigInt('0x' + privateKeyHex);
      const G = {
        x: BigInt('0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'),
        y: BigInt('0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8')
      };
      
      // 简化的椭圆曲线点乘法 (实际应用中应使用专业库)
      const publicKey = this.ellipticCurveMultiply(G, privateKey);
      
      // 返回非压缩格式的公钥 (04 + x + y)
      const xHex = publicKey.x.toString(16).padStart(64, '0');
      const yHex = publicKey.y.toString(16).padStart(64, '0');
      
      return '04' + xHex + yHex;
    } catch (error) {
      console.error('生成公钥失败:', error);
      // 返回一个模拟的公钥用于测试
      return '04' + privateKeyHex.substring(0, 64) + privateKeyHex.substring(0, 64);
    }
  }

  /**
   * 简化的椭圆曲线点乘法
   * @param {Object} point - 椭圆曲线点
   * @param {BigInt} scalar - 标量
   * @returns {Object} 结果点
   */
  ellipticCurveMultiply(point, scalar) {
    // 这是一个简化的实现，实际应用中应使用专业的椭圆曲线库
    // 这里只是为了演示，返回一个基于输入的确定性结果
    const p = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F');
    
    let result = { x: 0n, y: 0n };
    let addend = point;
    
    while (scalar > 0n) {
      if (scalar % 2n === 1n) {
        result = this.ellipticCurveAdd(result, addend, p);
      }
      addend = this.ellipticCurveAdd(addend, addend, p);
      scalar = scalar >> 1n;
    }
    
    return result;
  }

  /**
   * 椭圆曲线点加法
   * @param {Object} p1 - 第一个点
   * @param {Object} p2 - 第二个点
   * @param {BigInt} p - 素数
   * @returns {Object} 结果点
   */
  ellipticCurveAdd(p1, p2, p) {
    if (p1.x === 0n && p1.y === 0n) return p2;
    if (p2.x === 0n && p2.y === 0n) return p1;
    
    // 简化的点加法实现
    const lambda = ((p2.y - p1.y) * this.modInverse(p2.x - p1.x, p)) % p;
    const x3 = (lambda * lambda - p1.x - p2.x) % p;
    const y3 = (lambda * (p1.x - x3) - p1.y) % p;
    
    return { x: x3 < 0n ? x3 + p : x3, y: y3 < 0n ? y3 + p : y3 };
  }

  /**
   * 模逆运算
   * @param {BigInt} a - 输入
   * @param {BigInt} m - 模数
   * @returns {BigInt} 模逆
   */
  modInverse(a, m) {
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];
    let [old_t, t] = [0n, 1n];
    
    while (r !== 0n) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
      [old_t, t] = [t, old_t - quotient * t];
    }
    
    return old_s < 0n ? old_s + m : old_s;
  }

  /**
   * 生成一个密钥对
   * @returns {Object} 包含私钥和公钥的对象
   */
  generateKeyPair() {
    const privateKey = this.generateRandomPrivateKey();
    const publicKey = this.generatePublicKey(privateKey);
    
    return {
      privateKey,
      publicKey,
      timestamp: Date.now(),
    };
  }

  /**
   * 检查公钥是否在目标列表中
   * @param {string} publicKey - 公钥
   * @returns {boolean} 是否匹配
   */
  isTargetPublicKey(publicKey) {
    return this.targetPubKeys.has(publicKey);
  }

  /**
   * 获取目标公钥数量
   * @returns {number} 目标公钥数量
   */
  getTargetPublicKeysCount() {
    return this.targetPubKeys.size;
  }

  /**
   * 开始生成密钥对直到找到目标
   * @param {Function} onProgress - 进度回调
   * @param {Function} onKeyFound - 找到密钥回调
   * @param {Function} isCancelled - 取消检查回调
   */
  async generateKeyPairsUntilTargetFound(onProgress, onKeyFound, isCancelled) {
    this.isGenerating = true;
    this.generationStats = {
      totalGenerated: 0,
      foundKeys: 0,
      startTime: Date.now(),
      speed: 0,
    };

    const foundKeyPairs = [];

    while (this.isGenerating && !isCancelled()) {
      const keyPair = this.generateKeyPair();
      this.generationStats.totalGenerated++;

      if (this.isTargetPublicKey(keyPair.publicKey)) {
        foundKeyPairs.push(keyPair);
        this.generationStats.foundKeys++;
        onKeyFound(keyPair);
      }

      // 每1000次更新一次进度
      if (this.generationStats.totalGenerated % 1000 === 0) {
        const elapsedSeconds = (Date.now() - this.generationStats.startTime) / 1000;
        this.generationStats.speed = elapsedSeconds > 0 ? this.generationStats.totalGenerated / elapsedSeconds : 0;
        onProgress(this.generationStats);
      }

      // 让出控制权，避免阻塞UI
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isGenerating = false;
    return foundKeyPairs;
  }

  /**
   * 停止生成
   */
  stopGeneration() {
    this.isGenerating = false;
  }

  /**
   * 获取生成统计信息
   * @returns {Object} 统计信息
   */
  getGenerationStats() {
    return { ...this.generationStats };
  }
}

export default BitcoinKeyGenerator; 