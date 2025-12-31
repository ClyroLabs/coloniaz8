#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';
import { execSync } from 'child_process';
import 'dotenv/config';

const program = new Command();

program
    .command('supabase:init')
    .description('Inicializa a conexão com Supabase e configura variáveis de ambiente.')
    .action(async () => {
        const envPath = path.join(process.cwd(), '.env');
        let envContent = '';

        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        const url = await promptUser('🚀 Insira sua Supabase URL: ');
        const anonKey = await promptUser('🔑 Insira sua Supabase Anon Key: ');

        if (!url || !anonKey) {
            console.error(chalk.red('❌ URL e Anon Key são obrigatórias.'));
            process.exit(1);
        }

        let newEnvContent = envContent;

        // Helper to safely replace or append
        const setEnvVar = (content, key, value) => {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (regex.test(content)) {
                return content.replace(regex, `${key}=${value}`);
            } else {
                // Ensure meaningful newline separation if needed
                const prefix = (content.length > 0 && !content.endsWith('\n')) ? '\n' : '';
                return `${content}${prefix}${key}=${value}`;
            }
        };

        newEnvContent = setEnvVar(newEnvContent, 'SUPABASE_URL', url);
        newEnvContent = setEnvVar(newEnvContent, 'SUPABASE_ANON_KEY', anonKey);

        // Make sure we end with a newline for good measure
        if (!newEnvContent.endsWith('\n')) newEnvContent += '\n';

        try {
            fs.writeFileSync(envPath, newEnvContent);
            // "text-emerald-400" equivalent hex
            console.log(chalk.hex('#34d399')('🚀 Conexão com Supabase configurada com sucesso em .env!'));
        } catch (error) {
            console.error(chalk.red('❌ Erro ao configurar o Supabase. Verifique as permissões.'));
            process.exit(1);
        }

        // Ensure we exit
        process.exit(0);
    });

program
    .command('supabase:add-deps')
    .description('Instala as dependências necessárias do Supabase JS SDK.')
    .action(() => {
        let packageManager = 'npm';
        const yarnLockPath = path.join(process.cwd(), 'yarn.lock');
        const npmLockPath = path.join(process.cwd(), 'package-lock.json');

        if (fs.existsSync(yarnLockPath)) {
            packageManager = 'yarn';
        } else if (!fs.existsSync(npmLockPath)) {
            console.warn(chalk.yellow('⚠️ Nenhum lockfile encontrado. Usando npm por padrão.'));
        }

        const installCommand = packageManager === 'yarn' ? 'yarn add @supabase/supabase-js' : 'npm install @supabase/supabase-js';

        try {
            console.log(chalk.blue(`ℹ️ Executando: ${installCommand}...`));
            execSync(installCommand, { stdio: 'inherit' });
            // "text-emerald-400" equivalent hex: #34d399
            console.log(chalk.hex('#34d399')('📦 Dependências do Supabase instaladas com sucesso!'));
        } catch (error) {
            // "text-red-400" equivalent hex: #f87171
            console.error(chalk.hex('#f87171')('❌ Erro ao instalar dependências do Supabase.'));
            process.exit(1);
        }
    });

program
    .command('supabase:generate-client')
    .description('Gera um arquivo cliente Supabase (ex: src/lib/supabaseClient.ts).')
    .action(() => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error(chalk.hex('#f87171')('❌ Variáveis de ambiente SUPABASE_URL ou SUPABASE_ANON_KEY não encontradas. Execute `supabase:init` primeiro.'));
            process.exit(1);
        }

        const clientFilePath = path.join(process.cwd(), 'src', 'lib', 'supabaseClient.ts');
        const clientFileContent = `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Para usar tipos gerados pelo Supabase CLI:
// 1. Adicione '@supabase/cli' como dev dependency.
// 2. Execute 'supabase gen types typescript --linked --quiet > src/lib/database.types.ts'
// 3. Descomente a linha abaixo e ajuste o path se necessário:
// import { Database } from './database.types';
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
`;

        try {
            fs.mkdirSync(path.dirname(clientFilePath), { recursive: true });
            fs.writeFileSync(clientFilePath, clientFileContent.trim());
            console.log(chalk.hex('#34d399')(`✨ Cliente Supabase gerado em ${path.relative(process.cwd(), clientFilePath)}!`));
        } catch (error) {
            console.error(chalk.hex('#f87171')('❌ Erro ao gerar o cliente Supabase.'));
            process.exit(1);
        }
    });

function promptUser(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

program.parse(process.argv);
