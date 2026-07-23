import { StyleSheet } from '@react-pdf/renderer';

// Cores da paleta Luciana convertidas para hex (baseadas nos tokens HSL do design system)
export const COLORS = {
  carmim: '#7B192B',
  carmimDark: '#5A1220',
  gold: '#D4AF37',
  goldLight: '#E8CD7D',
  offWhite: '#F7F3EF',
  dustyMauve: '#BFAFB2',
  darkText: '#2D2D2D',
  lightText: '#646464',
  white: '#FFFFFF',
  success: '#228B22',
  warning: '#CD853F',
  info: '#4682B4',
};

// Dimensões A4 em pontos (pt)
export const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 40, // ~14mm
  footerHeight: 34,
  headerHeight: 60,
};

export const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

export const sharedStyles = StyleSheet.create({
  page: {
    paddingTop: PAGE.headerHeight + 8,
    paddingBottom: PAGE.footerHeight + PAGE.margin,
    paddingHorizontal: PAGE.margin,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.darkText,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PAGE.headerHeight,
    backgroundColor: COLORS.carmim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: COLORS.goldLight,
    textAlign: 'center',
    marginTop: 4,
  },
  headerLine: {
    position: 'absolute',
    bottom: 6,
    left: PAGE.width / 2 - 80,
    width: 160,
    height: 1,
    backgroundColor: COLORS.gold,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PAGE.footerHeight,
    backgroundColor: COLORS.offWhite,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerPageText: {
    fontSize: 9,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  footerCredit: {
    fontSize: 8,
    color: COLORS.carmim,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.carmim,
    marginBottom: 8,
    marginTop: 12,
  },
  sectionLine: {
    width: 100,
    height: 1,
    backgroundColor: COLORS.gold,
    marginBottom: 6,
  },
  card: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.carmim,
  },
  label: {
    fontSize: 9,
    color: COLORS.lightText,
  },
  value: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.carmim,
  },
  normalText: {
    fontSize: 10,
    color: COLORS.darkText,
    lineHeight: 1.5,
  },
  smallText: {
    fontSize: 8,
    color: COLORS.lightText,
  },
  introBox: {
    backgroundColor: COLORS.offWhite,
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gold,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  infoCard: {
    width: CONTENT_WIDTH / 2 - 4,
    backgroundColor: COLORS.offWhite,
    borderRadius: 4,
    padding: 8,
    minHeight: 50,
  },
  infoCardHighlight: {
    backgroundColor: COLORS.carmim,
  },
});
