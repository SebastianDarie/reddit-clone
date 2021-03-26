import {
  DeleteResult,
  EntityRepository,
  getManager,
  TreeRepository,
} from 'typeorm';
import { Comment } from '../entities/Comment';

@EntityRepository(Comment)
export class CommentTreeRepository<Comment> extends TreeRepository<Comment> {
  async deleteComment(id: number): Promise<DeleteResult> {
    return getManager().transaction(async (_transactionalEntityManager) => {
      const tableName = this.metadata.tablePath;
      const primaryColumn = this.metadata.primaryColumns[0].databasePath;
      const parentPropertyName = this.metadata.treeParentRelation
        ?.joinColumns[0].propertyName;
      const parentColumn = this.metadata.treeParentRelation?.joinColumns[0]
        .propertyPath;

      const closureTableName = this.metadata.closureJunctionTable.tablePath;
      const ancestorColumn = this.metadata.closureJunctionTable
        .ancestorColumns[0].databasePath;
      const descendantColumn = this.metadata.closureJunctionTable
        .descendantColumns[0].databasePath;

      const closureNodes = await this.createQueryBuilder()
        .select(`closure.${descendantColumn}`)
        .distinct(true)
        .from(closureTableName, 'closure')
        .where(`closure.${ancestorColumn} = :ancestorId`, { ancestorId: id })
        .getRawMany();

      const descendantNodeIds = closureNodes.map(
        (v) => v[`closure_${descendantColumn}`]
      );

      await this.createQueryBuilder()
        .delete()
        .from(closureTableName)
        .where(`${descendantColumn} IN (:...ids)`, { ids: descendantNodeIds })
        .execute();

      await this.createQueryBuilder()
        .update(tableName, { [parentPropertyName]: null })
        .where(`${parentColumn} IN (:...ids)`, { ids: descendantNodeIds })
        .execute();

      await this.createQueryBuilder()
        .delete()
        .from(tableName)
        .where(`${primaryColumn} IN (:...ids)`, { ids: descendantNodeIds })
        .execute();

      return { raw: descendantNodeIds };
    });
  }
}
