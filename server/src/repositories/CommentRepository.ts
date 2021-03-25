// import { DeleteResult, TreeRepository } from 'typeorm';
// import { Transactional } from 'typeorm-transactional-cls-hooked';

// export class BaseTreeRepository<T> extends TreeRepository<T> {
//     @Transactional()
//     async delete(id: string): Promise<DeleteResult> {
//         const tableName = this.metadata.tablePath;
//         const primaryColumn = this.metadata.primaryColumns[0].databasePath;
//         const parentPropertyName = this.metadata.treeParentRelation.joinColumns[0].propertyName;
//         const parentColumn = this.metadata.treeParentRelation.joinColumns[0].databasePath;

//         const closureTableName = this.metadata.closureJunctionTable.tablePath;
//         const ancestorColumn = this.metadata.closureJunctionTable.ancestorColumns[0].databasePath;
//         const descendantColumn = this.metadata.closureJunctionTable.descendantColumns[0].databasePath;

//         // Get all the descendant node ids from the closure table
//         const closureNodes = await this.createQueryBuilder()
//             .select(`closure.${descendantColumn}`)
//             .distinct(true)
//             .from(closureTableName, 'closure')
//             .where(`closure.${ancestorColumn} = :ancestorId`, { ancestorId: id })
//             .getRawMany();

//         const descendantNodeIds = closureNodes.map((v) => v[`closure_${descendantColumn}`]);

//         // Delete all the nodes from the closure table
//         await this.createQueryBuilder()
//             .delete()
//             .from(closureTableName)
//             .where(`${descendantColumn} IN (:...ids)`, { ids: descendantNodeIds })
//             .execute();

//         // Set parent FK to null in the main table
//         await this.createQueryBuilder()
//             .update(tableName, { [parentPropertyName]: null })
//             .where(`${parentColumn} IN (:...ids)`, { ids: descendantNodeIds })
//             .execute();

//         // Delete from main table
//         await this.createQueryBuilder()
//             .delete()
//             .from(tableName)
//             .where(`${primaryColumn} IN (:...ids)`, { ids: descendantNodeIds })
//             .execute();

//         return { raw: descendantNodeIds };
//     }
// }
