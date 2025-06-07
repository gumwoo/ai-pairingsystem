const db = require('../config/db');
const pool = db.pool;
const logger = require('../utils/logger');

class Liquor {
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT l.*, n.is_hub
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
      `);
      return rows;
    } catch (error) {
      logger.error('Error getting all liquors:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT l.*, n.is_hub, n.created_at as node_created_at, n.updated_at as node_updated_at
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
        WHERE l.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      logger.error('Error getting liquor by id:', error);
      throw error;
    }
  }

  static async getByNodeId(nodeId) {
    try {
      console.log(`Liquor.getByNodeId: Looking for node_id = ${nodeId}`);
      const [rows] = await pool.query(`
        SELECT l.*, n.is_hub, n.created_at as node_created_at, n.updated_at as node_updated_at
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
        WHERE n.node_id = ?
      `, [nodeId]);
      console.log(`Liquor.getByNodeId: Found ${rows.length} rows`);
      if (rows.length > 0) {
        console.log(`Liquor.getByNodeId: First row:`, rows[0]);
      }
      return rows[0];
    } catch (error) {
      logger.error('Error getting liquor by node_id:', error);
      throw error;
    }
  }

  static async findOne(criteria) {
    try {
      // criteria 객체에서 key-value 쌍 추출
      const conditions = [];
      const values = [];
      
      Object.entries(criteria).forEach(([key, value]) => {
        // 필드명을 SQL 친화적으로 변환 (예: nodeId -> node_id)
        const fieldName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        // 테이블 별칭 추가 (node_id는 두 테이블에 모두 있으므로 주의)
        const prefix = key === 'node_id' ? 'l.' : (key.startsWith('node_') ? 'n.' : 'l.');
        
        conditions.push(`${prefix}${fieldName} = ?`);
        values.push(value);
      });
      
      if (conditions.length === 0) {
        return null;
      }
      
      const [rows] = await pool.query(`
        SELECT l.*, n.is_hub, n.created_at as node_created_at, n.updated_at as node_updated_at
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
        WHERE ${conditions.join(' AND ')}
        LIMIT 1
      `, values);
      
      // Log the query for debugging
      console.log('Liquor.findOne query:', `
        SELECT l.*, n.is_hub, n.created_at as node_created_at, n.updated_at as node_updated_at
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
        WHERE ${conditions.join(' AND ')}
        LIMIT 1
      `, values);
      
      return rows[0];
    } catch (error) {
      logger.error('Error in Liquor.findOne:', error);
      throw error;
    }
  }

  static async searchByName(searchTerm) {
    try {
      const [rows] = await pool.query(`
        SELECT l.*, n.is_hub
        FROM liquors l
        JOIN nodes n ON l.node_id = n.id
        WHERE l.name LIKE ?
        ORDER BY 
          CASE 
            WHEN l.name = ? THEN 1
            WHEN l.name LIKE ? THEN 2
            ELSE 3
          END
        LIMIT 20
      `, [`%${searchTerm}%`, searchTerm, `${searchTerm}%`]);
      return rows;
    } catch (error) {
      logger.error('Error searching liquors:', error);
      throw error;
    }
  }

  static async create(liquorData) {
    const { name, type, description, origin, alcoholContent, imageUrl } = liquorData;
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create node first
      const [nodeResult] = await connection.query(
        `INSERT INTO nodes 
         (node_id, name, external_id, node_type, is_hub, description, image_url)
         VALUES (?, ?, ?, 'liquor', false, ?, ?)`,
        [liquorData.nodeId || Math.floor(Math.random() * 1000000), name, null, description, imageUrl]
      );
      
      const nodeId = nodeResult.insertId;
      
      // Create liquor
      const [liquorResult] = await connection.query(
        `INSERT INTO liquors 
         (node_id, name, type, description, origin, alcohol_content, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nodeId, name, type, description, origin, alcoholContent, imageUrl]
      );
      
      await connection.commit();
      return liquorResult.insertId;
    } catch (error) {
      await connection.rollback();
      logger.error('Error creating liquor:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, liquorData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update liquor table
      const liquorUpdates = [];
      const liquorValues = [];
      
      ['name', 'type', 'description', 'origin', 'alcoholContent', 'imageUrl'].forEach(key => {
        if (liquorData[key] !== undefined) {
          liquorUpdates.push(`${this.camelToSnake(key)} = ?`);
          liquorValues.push(liquorData[key]);
        }
      });
      
      if (liquorUpdates.length > 0) {
        liquorValues.push(id);
        await connection.query(
          `UPDATE liquors SET ${liquorUpdates.join(', ')} WHERE id = ?`,
          liquorValues
        );
      }
      
      // Update node table if needed
      const nodeUpdates = [];
      const nodeValues = [];
      
      ['name', 'description', 'imageUrl'].forEach(key => {
        if (liquorData[key] !== undefined) {
          nodeUpdates.push(`${this.camelToSnake(key)} = ?`);
          nodeValues.push(liquorData[key]);
        }
      });
      
      if (nodeUpdates.length > 0) {
        nodeValues.push(id);
        await connection.query(
          `UPDATE nodes n
           JOIN liquors l ON n.id = l.node_id
           SET ${nodeUpdates.join(', ')}
           WHERE l.id = ?`,
          nodeValues
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      logger.error('Error updating liquor:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      // Cascading delete will handle nodes table
      const [result] = await pool.query(
        'DELETE FROM liquors WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting liquor:', error);
      throw error;
    }
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = Liquor;