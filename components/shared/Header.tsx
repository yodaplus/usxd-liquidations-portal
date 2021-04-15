/** @jsx jsx */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Flex, NavLink, Container, Close, Box, IconButton, Divider, jsx, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button';
import { Icon } from '@makerdao/dai-ui-icons';

import { COLLATERAL_ARRAY } from 'lib/constants';
import { getNetwork } from 'lib/maker';
import { useAuctions, useAccountTokenBalance } from 'lib/hooks';
import { useModalsStore } from 'stores/modals';
import useAccountsStore from 'stores/accounts';
import useApprovalsStore from 'stores/approvals';
import AccountSelect from 'components/header/AccountSelect';
import DepositWithdrawModal from './DepositWithdrawModal';
import { COLLATERAL_MAP } from '../../lib/constants';

const Header = (props: any): JSX.Element => {
  const network = getNetwork();
  const router = useRouter();
  const bpi = useBreakpointIndex();
  const { data: auctions } = useAuctions();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isDepositWithdrawOpen = useModalsStore(state => state.isDepositWithdrawOpen);
  const toggleDepositWithdraw = useModalsStore(state => state.toggleDepositWithdraw);
  const account = useAccountsStore(state => state.currentAccount);
  const address = account?.address;
  const initApprovals = useApprovalsStore(state => state.initApprovals);
  const { data: daiBalance } = useAccountTokenBalance('DAI', address);

  useEffect(() => {
    if (!address) return;
    initApprovals(
      address,
      Object.keys(COLLATERAL_MAP).map(ilk => COLLATERAL_MAP[ilk].symbol)
    );
  }, [address]);

  return (
    <>
      <DepositWithdrawModal
        showDialog={isDepositWithdrawOpen}
        onDismiss={toggleDepositWithdraw}
        mobile={bpi === 0}
        vatBalance={undefined}
      />

      <Box
        as="header"
        pt={3}
        pb={[4, 5]}
        px={[2, 0]}
        variant="styles.header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}
        {...props}
      >
        <Link href={{ pathname: '/', query: { network } }}>
          <IconButton aria-label="Maker home" sx={{ width: '40px', height: 4, p: 0 }}>
            <Icon name="maker" size="40px" sx={{ cursor: 'pointer' }} />
          </IconButton>
        </Link>
        <Flex sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Menu>
            <MenuButton
              style={{
                borderWidth: 0,
                backgroundColor: 'inherit',
                padding: 0,
                // override CSS from @reach
                fontFamily: '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu',
                lineHeight: '24px',
                letterSpacing: '0.4px',
                color: '#222223',
                fontSize: '16px'
              }}
            >
              <Text
                p={2}
                sx={{
                  fontSize: 3,
                  display: ['none', 'block'],
                  color: router?.asPath?.startsWith('/auctions') ? 'primary' : undefined
                }}
              >
                Auctions
              </Text>
              <MenuList sx={{ variant: 'cards.compact', width: 6 }}>
                {COLLATERAL_ARRAY.map((type, index) => {
                  const numberOfAuctions = auctions
                    ? auctions.filter(a => a.name === type.key).length.toString()
                    : '0';
                  return (
                    <MenuItem key={index} onSelect={() => router.push(`/auctions/${type.key}`)}>
                      <Flex sx={{ justifyContent: 'space-between', py: 1, cursor: 'pointer', fontSize: 2 }}>
                        <Text>{type.key.toUpperCase()}</Text>
                        <Text sx={{ color: 'textSecondary' }}>{numberOfAuctions}</Text>
                      </Flex>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </MenuButton>
          </Menu>

          <Link href={{ pathname: '/education', query: { network } }} passHref>
            <NavLink
              p={0}
              sx={{
                display: ['none', 'block'],
                ml: [0, 2, 4],
                color: router?.asPath?.startsWith('/education') ? 'primary' : undefined
              }}
            >
              Education
            </NavLink>
          </Link>

          {address && (
            <Button
              aria-label="Deposit or Withdraw Dai"
              sx={{
                variant: 'buttons.card',
                borderRadius: 'round',
                color: 'textMuted',
                px: [2, 2, 3],
                py: 2,
                ml: [2, 2, 4],
                alignSelf: 'flex-end',
                '&:hover': {
                  color: 'text',
                  borderColor: 'onSecondary',
                  backgroundColor: 'white'
                }
              }}
              {...props}
              onClick={toggleDepositWithdraw}
            >
              <Flex sx={{ alignItems: 'center' }}>
                <Text>{daiBalance}</Text>
                <Icon name="dai" size="16px" sx={{ mx: [0, 2] }} />
                <Text sx={{ display: ['none', 'block'] }}>Deposit/Withdraw</Text>
              </Flex>
            </Button>
          )}

          <AccountSelect sx={{ ml: [1, 2, 4] }} />

          <IconButton
            aria-label="Show menu"
            ml="3"
            sx={{ display: [null, 'none'], height: '28px', width: '24px', p: 0 }}
            onClick={() => setShowMobileMenu(true)}
          >
            <Icon name="menu" sx={{ width: '18px' }} />
          </IconButton>
          {showMobileMenu && (
            <MobileMenu hide={() => setShowMobileMenu(false)} router={router} {...{ network }} />
          )}
        </Flex>
      </Box>
    </>
  );
};

const MobileMenu = ({ hide, network, router }) => {
  useEffect(() => {
    router.events.on('routeChangeComplete', hide);
  }, []);

  return (
    <Container variant="modal">
      <Close ml="auto" sx={{ display: ['block'], '> svg': { size: [4] } }} onClick={hide} />
      <Flex
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          mt: 4,
          justifyContent: 'space-between',
          height: '40vh',
          '> a': {
            fontSize: 6
          }
        }}
      >
        <Link href={{ pathname: '/', query: { network } }}>
          <NavLink>Home</NavLink>
        </Link>
        <Divider sx={{ width: '100%' }} />
        <Link href={{ pathname: '/auctions', query: { network } }}>
          <NavLink>Auctions</NavLink>
        </Link>
        {COLLATERAL_ARRAY.map(type => {
          return (
            <Link key={type.key} href={{ pathname: `/auctions/${type.key}`, query: { network } }}>
              <NavLink>
                <Text variant="links.nav" sx={{ fontSize: 5 }}>
                  {type.key.toUpperCase()}
                </Text>
              </NavLink>
            </Link>
          );
        })}
        <Divider sx={{ width: '100%' }} />
        <Link href={{ pathname: '/education', query: { network } }}>
          <NavLink>Education</NavLink>
        </Link>
      </Flex>
    </Container>
  );
};

export default Header;
