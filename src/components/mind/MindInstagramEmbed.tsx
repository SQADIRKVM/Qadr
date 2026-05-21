import React, { useMemo, createElement } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { ColorPalette } from '../../theme/palettes';

interface MindInstagramEmbedProps {
  embedHtml: string;
  height?: number;
}

export const EMBED_WRAPPER = (html: string) => `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #111; overflow: hidden; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100%; }
  .ig-wrap { width: 100%; max-width: 100%; }
  blockquote.instagram-media { margin: 0 auto !important; min-width: 0 !important; width: 100% !important; }
</style>
<script async src="https://www.instagram.com/embed.js"></script>
</head><body><div class="ig-wrap">${html}</div></body></html>`;

export const MindInstagramEmbed: React.FC<MindInstagramEmbedProps> = ({
  embedHtml,
  height = 320,
}) => {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const source = useMemo(
    () => ({ html: EMBED_WRAPPER(embedHtml), baseUrl: 'https://www.instagram.com' }),
    [embedHtml],
  );

  const docHtml = useMemo(() => EMBED_WRAPPER(embedHtml), [embedHtml]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, { height }]}>
        {createElement('iframe', {
          title: 'Instagram post',
          srcDoc: docHtml,
          sandbox: 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
          style: {
            width: '100%',
            height,
            border: 'none',
            borderRadius: spacing.cardRadius,
            backgroundColor: colors.surfaceContainerLowest,
          },
        })}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height }]}>
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
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLowest,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
