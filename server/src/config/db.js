const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// MySQL 연결 풀 설정
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rladnwnd12!',
  database: 'ai_pairing_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 데이터베이스 연결 함수
const connectDB = async () => {
  try {
    // 연결 테스트
    const connection = await pool.getConnection();
    console.log(`MySQL Connected: ${connection.config.host}`);
    
    // 연결 반환
    connection.release();
    
    return pool;
  } catch (error) {
    console.error(`Error connecting to MySQL: ${error.message}`);
    logger.error(`Error connecting to MySQL: ${error.message}`);
    process.exit(1);
  }
};

// 데이터베이스 초기화 함수 (애플리케이션 처음 실행 시 수행)
const initializeDB = async () => {
  try {
    const connection = await pool.getConnection();
    
    // SQL 초기화 파일 읽기
    const initFilePath = path.join(__dirname, 'init.sql');
    
    // 파일이 존재하는지 확인
    if (fs.existsSync(initFilePath)) {
      let initSql = fs.readFileSync(initFilePath, 'utf8');
      
      // USE 문 제거 (connection pool에서 이미 데이터베이스를 지정했기 때문에 필요 없음)
      initSql = initSql.replace(/USE.*;/, '');
      
      // SQL 명령어들 분리하여 실행
      const sqlStatements = initSql.split(';').filter(statement => statement.trim());
      
      for (const statement of sqlStatements) {
        if (statement.trim()) {
          try {
            await connection.execute(`${statement}`);
          } catch (err) {
            // 이미 테이블이 존재하는 경우 등의 에러는 무시
            if (!err.message.includes('already exists')) {
              console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
              console.error(err.message);
            }
          }
        }
      }
      
      console.log('Database initialized successfully');
    } else {
      console.warn('Database initialization file not found');
    }
    
    connection.release();
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
    logger.error(`Error initializing database: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  initializeDB,
  pool
};