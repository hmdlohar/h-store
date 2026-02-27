const fs = require("fs");
const path = require("path");
const templateRegistry = require("../templates/templateRegistry");

class MessageTemplateService {
  static extractVariables(text) {
    if (!text) return [];
    const regex = /\$\{([^}]+)\}/g;
    const vars = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      vars.push(match[1]);
    }
    return [...new Set(vars)];
  }

  static replaceVariables(text, variables) {
    if (!text) return "";
    return text.replace(/\$\{([^}]+)\}/g, (full, varName) => {
      return variables && variables[varName] !== undefined ? variables[varName] : full;
    });
  }

  static getTemplate(templateName) {
    return templateRegistry[templateName] || null;
  }

  static async renderTemplate(templateName, variables = {}) {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template "${templateName}" is not configured in templateRegistry.js`);
    }

    const templatePath = path.join(__dirname, "..", "templates", template.file);
    const content = await fs.promises.readFile(templatePath, "utf8");
    const requiredVariables = template.variables || [];
    const missingVars = requiredVariables.filter((v) => variables[v] === undefined);
    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(", ")}`);
    }

    return {
      content: this.replaceVariables(content, variables),
      templateName,
      templateFile: template.file,
      requiredVariables,
    };
  }

  static async renderTemplateById() {
    throw new Error("renderTemplateById is not supported with file-based templates");
  }
}

module.exports = MessageTemplateService;
