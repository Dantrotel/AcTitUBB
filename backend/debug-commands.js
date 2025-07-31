import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function debugCommands() {
    try {
        const databaseScriptPath = path.join(__dirname, 'src/db/database.sql');
        console.log("📁 Ruta del archivo:", databaseScriptPath);
        
        const databaseScript = fs.readFileSync(databaseScriptPath, 'utf8');
        console.log("📄 Archivo leído, tamaño:", databaseScript.length, "caracteres");
        
        // Usar la misma lógica que connectionDB.js
        const commandRegex = /([^;]+;)/g;
        const commands = [];
        let match;
        
        while ((match = commandRegex.exec(databaseScript)) !== null) {
            const command = match[1].trim();
            if (command.length > 0 && !command.startsWith('--')) {
                commands.push(command);
            }
        }

        console.log(`📊 Total de comandos encontrados: ${commands.length}`);
        
        // Mostrar todos los comandos
        for (let i = 0; i < commands.length; i++) {
            console.log(`\n🔍 Comando ${i + 1}:`);
            console.log(`   Texto: ${commands[i].substring(0, 150)}...`);
            console.log(`   Tipo: ${getCommandType(commands[i])}`);
            console.log(`   Longitud: ${commands[i].length} caracteres`);
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

function getCommandType(command) {
    const upperCommand = command.toUpperCase();
    if (upperCommand.includes('CREATE TABLE')) return 'CREATE TABLE';
    if (upperCommand.includes('INSERT INTO')) return 'INSERT';
    if (upperCommand.includes('CREATE INDEX')) return 'CREATE INDEX';
    if (upperCommand.includes('CREATE USER')) return 'CREATE USER';
    if (upperCommand.includes('GRANT')) return 'GRANT';
    if (upperCommand.includes('FLUSH')) return 'FLUSH';
    if (upperCommand.includes('CREATE DATABASE')) return 'CREATE DATABASE';
    if (upperCommand.includes('USE')) return 'USE';
    return 'OTRO';
}

debugCommands(); 