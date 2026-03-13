import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

// Chinese summaries for common licenses
const LICENSE_SUMMARIES_ZH: Record<string, string> = {
  'MIT': '最宽松的许可证之一。允许任何人以任何目的使用、复制、修改、合并、发布、分发、再授权和/或销售软件。唯一条件是在所有副本中包含版权声明和许可声明。',
  'Apache-2.0': '允许自由使用、修改和分发，同时提供专利权授予。要求保留版权声明，并在修改文件时注明更改。包含专利诉讼终止条款。',
  'GPL-3.0-only': '强Copyleft许可证。要求任何基于GPL代码的衍生作品也必须以GPL许可证发布。确保软件及其衍生品始终保持开源。禁止添加额外限制。',
  'GPL-2.0-only': 'GPL第2版。与GPL-3.0类似，但不包含专利授权条款和反Tivoization条款。衍生作品必须以相同许可证发布。',
  'BSD-3-Clause': '宽松许可证。允许自由使用和分发，条件是保留版权声明。禁止使用贡献者名称进行背书。',
  'BSD-2-Clause': '简化版BSD许可证。与BSD-3-Clause类似，但移除了禁止使用名称背书的条款。',
  'LGPL-3.0-only': '弱Copyleft许可证。允许将LGPL库链接到非LGPL程序中而不要求整个程序开源。库本身的修改必须开源。',
  'MPL-2.0': '文件级Copyleft许可证。修改的文件必须以MPL发布，但可以与其他许可证的代码混合使用。平衡了开源要求和商业使用灵活性。',
  'AGPL-3.0-only': '最强的Copyleft许可证。类似GPL-3.0，但额外要求通过网络提供服务时也必须提供源代码。适用于SaaS和Web应用。',
  'Unlicense': '将作品贡献到公共领域。放弃所有版权，允许任何人以任何目的自由使用。无任何条件或限制。',
};

export function seedLicenses(db: Database.Database) {
  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as count FROM licenses').get() as { count: number };
  if (count.count > 0) return;

  let spdxList: Record<string, { name: string; licenseText?: string }>;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    spdxList = require('spdx-license-list/full');
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    spdxList = require('spdx-license-list');
  }

  const insert = db.prepare(
    'INSERT OR IGNORE INTO licenses (id, name, spdx_id, text, summary_zh) VALUES (?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction(() => {
    for (const [spdxId, info] of Object.entries(spdxList)) {
      const id = uuidv4();
      const summaryZh = LICENSE_SUMMARIES_ZH[spdxId] || null;
      insert.run(id, info.name || spdxId, spdxId, info.licenseText || null, summaryZh);
    }
  });

  insertMany();
}
