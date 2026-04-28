# Instruções de Publicação: Decifra PWA -> Google Play Store

Este guia descreve como transformar o PWA Decifra em um aplicativo Android usando **Trusted Web Activity (TWA)** e publicá-lo na Google Play Store.

## 1. Pré-requisitos

- **Java JDK 17+**: Necessário para compilar o projeto Android.
- **Android Studio**: Para gerenciar o SDK do Android e realizar o build.
- **Domínio Próprio**: Seu PWA deve estar hospedado em um domínio HTTPS (ex: `https://decifra.app`).

## 2. Configuração do Ambiente

1.  **Instale o Java JDK**: [Download JDK](https://www.oracle.com/java/technologies/downloads/).
2.  **Instale o Android Studio**: [Download Android Studio](https://developer.android.com/studio).
3.  **Abra o projeto**: No Android Studio, selecione "Open" e escolha a pasta `/android-twa`.

## 3. Gerando o Keystore de Produção

O Keystore é a sua assinatura digital. **NÃO PERCA ESTE ARQUIVO.**

No terminal (ou via Android Studio: *Build > Generate Signed Bundle / APK*):

```bash
keytool -genkey -v -keystore decifra-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias decifra-alias
```

## 4. Obtendo o SHA-256 Fingerprint

Após criar o keystore, obtenha o SHA-256 para o `assetlinks.json`:

```bash
keytool -list -v -keystore decifra-key.jks -alias decifra-alias
```

Procure pela linha que começa com `SHA256:`. Copie essa sequência de números e letras.

## 5. Vinculação Digital (Digital Asset Links)

Para remover a barra de endereços do navegador no app Android:

1.  Abra `public/.well-known/assetlinks.json`.
2.  Substitua `PLACEHOLDER_SHA256` pelo fingerprint obtido no passo 4.
3.  Abra `android-twa/app/src/main/res/values/strings.xml`.
4.  Substitua `PLACEHOLDER_SHA256` no campo `asset_statements` também.
5.  **Importante**: O arquivo `assetlinks.json` deve estar acessível em `https://seu-dominio.app/.well-known/assetlinks.json`.

## 6. Realizando o Build (APK/AAB)

No Android Studio:
1.  Vá em **Build > Generate Signed Bundle / APK...**
2.  Escolha **Android App Bundle (.aab)** (recomendado para a Play Store).
3.  Siga as instruções usando o arquivo `decifra-key.jks` criado anteriormente.

## 7. Upload no Play Console

1.  Acesse o [Google Play Console](https://play.google.com/console).
2.  Crie um novo app.
3.  Vá em **Produção > Versões > Criar nova versão**.
4.  Faça o upload do arquivo `.aab` gerado.
5.  Preencha as informações da ficha da loja (screenshots, descrição).

## 8. Verificação

Você pode verificar se o seu arquivo `assetlinks.json` está correto usando o [Digital Asset Links API](https://developers.google.com/digital-asset-links/tools/generator).

---
**Nota sobre o Service Worker**: Certifique-se de que o `sw.js` está configurado para funcionar offline. O TWA exige que o app tenha uma experiência offline mínima para ser aceito na Play Store.
