const MessageTemplate = require("../models/MessageTemplate");

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

  static async getTemplate(name, type = null) {
    const query = { name, isActive: true };
    if (type) {
      query.type = type;
    }
    return await MessageTemplate.findOne(query);
  }

  static async renderTemplate(templateName, variables, type = null) {
    const template = await this.getTemplate(templateName, type);
    
    if (!template) {
      throw new Error(`Template "${templateName}" not found or inactive`);
    }

    const missingVars = template.variables?.filter(v => variables[v] === undefined) || [];
    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(", ")}`);
    }

    const subject = template.subject ? this.replaceVariables(template.subject, variables) : "";
    const content = this.replaceVariables(template.content, variables);

    return {
      subject,
      content,
      type: template.type,
      templateId: template._id,
      templateName: template.name,
    };
  }

  static async renderTemplateById(templateId, variables) {
    const template = await MessageTemplate.findById(templateId);
    
    if (!template) {
      throw new Error(`Template not found`);
    }

    if (!template.isActive) {
      throw new Error(`Template is inactive`);
    }

    const missingVars = template.variables?.filter(v => variables[v] === undefined) || [];
    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(", ")}`);
    }

    const subject = template.subject ? this.replaceVariables(template.subject, variables) : "";
    const content = this.replaceVariables(template.content, variables);

    return {
      subject,
      content,
      type: template.type,
      templateId: template._id,
      templateName: template.name,
    };
  }
}

module.exports = MessageTemplateService;
