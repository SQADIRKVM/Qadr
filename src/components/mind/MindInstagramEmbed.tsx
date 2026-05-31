import React, { useMemo, createElement } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { spacing } from '../../theme/spacing';
import { useColors, useThemeMode } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindInstagramEmbedProps {
  embedHtml: string;
  height?: number;
  isTwitter?: boolean;
}

export const EMBED_WRAPPER = (html: string, isTwitter = false, themeMode = 'dark', bgColor = '#111') => {
  let processedHtml = html;
  if (isTwitter) {
    const themeAttr = `data-theme="${themeMode}"`;
    if (html.includes('<blockquote')) {
      processedHtml = html.replace('<blockquote', `<blockquote ${themeAttr}`);
    }
  }
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${bgColor}; overflow: hidden; height: 100%; width: 100%; }
  body { display: flex; align-items: flex-start; justify-content: center; }
  .embed-wrap { width: 100%; max-width: 100%; display: flex; justify-content: center; }
  blockquote.instagram-media, blockquote.twitter-tweet { margin: 0 auto !important; min-width: 0 !important; width: 100% !important; }
  iframe { margin: 0 auto !important; display: block !important; }
</style>
${isTwitter ? '' : '<script async src="https://www.instagram.com/embed.js"></script>'}
</head><body><div class="embed-wrap">${processedHtml}</div></body></html>`;
};

export const MindInstagramEmbed: React.FC<MindInstagramEmbedProps> = ({
  embedHtml,
  height = 320,
  isTwitter = false,
}) => {
  const colors = useColors();
  const themeMode = useThemeMode();
  const styles = useThemedStyles(createStyles);
  
  const embedBg = isTwitter
    ? themeMode === 'dark'
      ? '#15202B'
      : '#FFFFFF'
    : colors.surfaceContainerLowest;

  const source = useMemo(
    () => ({
      html: EMBED_WRAPPER(embedHtml, isTwitter, themeMode, embedBg),
      baseUrl: isTwitter ? 'https://x.com' : 'https://www.instagram.com',
    }),
    [embedHtml, isTwitter, themeMode, embedBg],
  );

  const docHtml = useMemo(
    () => EMBED_WRAPPER(embedHtml, isTwitter, themeMode, embedBg),
    [embedHtml, isTwitter, themeMode, embedBg],
  );

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, { height, backgroundColor: embedBg }]}>
        {createElement('iframe', {
          title: isTwitter ? 'X post' : 'Instagram post',
          srcDoc: docHtml,
          sandbox: 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
          style: {
            width: '100%',
            height,
            border: 'none',
            borderRadius: spacing.cardRadius,
            backgroundColor: embedBg,
          },
        })}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height, backgroundColor: embedBg }]}>
      <WebView
        source={source}
        style={styles.webview}
        scrollEnabled={false}
        nestedScrollEnabled
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction
      />
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 550,
    alignSelf: 'center',
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLowest,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
