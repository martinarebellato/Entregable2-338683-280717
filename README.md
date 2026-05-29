# Entrega 2 - Contrato Multisig (338683-280717)


## Descripción

Este proyecto implementa un contrato inteligente de firma múltiple (*multisig*) en Solidity.

El contrato permite que un conjunto de direcciones autorizadas (*signers*) pueda crear, aprobar, ejecutar y cancelar propuestas de transacción. Una propuesta solo puede ejecutarse cuando alcanza una cantidad mínima de aprobaciones configurada en el despliegue del contrato, llamada `threshold`.

## Decisión de diseño

Para esta versión se decidió utilizar un conjunto de signers fijo.

Esto significa que las direcciones autorizadas se definen al momento de desplegar el contrato y no pueden modificarse luego. Esta decisión simplifica la implementación y hace que el comportamiento del contrato sea más claro para esta entrega.

El constructor recibe:

* `initialSigners`: lista de direcciones autorizadas.
* `initialThreshold`: cantidad mínima de aprobaciones necesarias para ejecutar una propuesta.

Ejemplo:

```solidity
["0xSigner1", "0xSigner2", "0xSigner3"], 2
```

En este caso, existen tres signers y una propuesta necesita al menos dos aprobaciones para poder ejecutarse.

## Funcionalidades implementadas

El contrato `Multisig.sol` implementa las siguientes funcionalidades:

### Crear propuesta

Cualquier signer puede crear una propuesta indicando:

* dirección destino,
* valor en ETH,
* calldata opcional.

La propuesta queda inicialmente pendiente, con `approvals = 0`.

### Aprobar propuesta

Cada signer puede aprobar una propuesta pendiente.

El contrato valida que:

* quien aprueba sea signer,
* la propuesta exista,
* la propuesta no esté ejecutada,
* la propuesta no esté cancelada,
* el signer no haya aprobado previamente esa misma propuesta.

### Ejecutar propuesta

Una propuesta puede ejecutarse cuando alcanza al menos la cantidad de aprobaciones definida por el `threshold`.

El contrato valida que:

* quien ejecuta sea signer,
* la propuesta exista,
* no esté ejecutada,
* no esté cancelada,
* tenga suficientes aprobaciones.

Para enviar ETH o ejecutar calldata se utiliza:

```solidity
call{value: proposal.value}(proposal.data)
```

Antes de realizar la llamada externa, el contrato marca la propuesta como ejecutada. Esto sigue el patrón *checks-effects-interactions*.

### Cancelar propuesta

El proponente original puede cancelar una propuesta siempre que todavía no haya sido ejecutada.

El contrato valida que:

* quien cancela sea signer,
* la propuesta exista,
* no esté ejecutada,
* no esté cancelada,
* quien cancela sea el proponente original.

### Funciones de lectura

Se agregaron funciones auxiliares para facilitar la integración con el frontend:

* `getSigners()`
* `getProposal(uint256 proposalId)`
* `hasSignerApproved(uint256 proposalId, address signer)`

Estas funciones permiten consultar el estado del contrato y de las propuestas desde React.

## Eventos

El contrato emite eventos para las acciones principales:

```solidity
event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address destination, uint256 value, bytes data);
event ProposalApproved(uint256 indexed proposalId, address indexed signer);
event ProposalExecuted(uint256 indexed proposalId);
event ProposalCancelled(uint256 indexed proposalId);
```

## Estructura del contrato

El archivo principal se encuentra en:

```text
contracts/Multisig.sol
```

## Compilación en Remix

Para compilar el contrato:

1. Abrir Remix: https://remix.ethereum.org/
2. Crear o abrir el archivo:

```text
contracts/Multisig.sol
```

3. Ir a la pestaña **Solidity Compiler**.
4. Seleccionar una versión compatible con:

```solidity
pragma solidity >=0.8.2 <0.9.0;
```

5. Presionar **Compile Multisig.sol**.

## Despliegue en Remix

Para desplegar el contrato:

1. Ir a la pestaña **Deploy & Run Transactions**.
2. Seleccionar un ambiente, por ejemplo:

```text
Remix VM
```

3. En el constructor completar:

```text
initialSigners:
["0xSigner1","0xSigner2","0xSigner3"]

initialThreshold:
2
```

4. Presionar **Deploy**.

## Pruebas manuales realizadas

Se realizaron pruebas manuales desde Remix para validar el flujo principal del contrato.

### 1. Deploy

Se desplegó el contrato con tres signers y un threshold de `2`.

Se verificó que:

* `threshold()` devuelve `2`.
* `getSigners()` devuelve la lista de signers configurada.

### 2. Crear propuesta

Se llamó a:

```solidity
createProposal(destination, 0, "0x")
```

Se verificó que:

* `proposalCount()` devuelve `1`.
* `getProposal(0)` devuelve la propuesta creada.
* La propuesta comienza con `approvals = 0`.
* La propuesta comienza con `executed = false`.
* La propuesta comienza con `cancelled = false`.

### 3. Aprobar propuesta

Se aprobó la propuesta con dos signers distintos llamando a:

```solidity
approveProposal(0)
```

Se verificó que:

* luego de la primera aprobación, `approvals = 1`.
* luego de la segunda aprobación, `approvals = 2`.
* `hasSignerApproved(0, signer)` devuelve `true` para el signer que aprobó.

### 4. Rechazo de aprobación duplicada

Se intentó aprobar dos veces la misma propuesta con el mismo signer.

El contrato rechazó la operación con el error:

```solidity
AlreadyApproved
```

### 5. Ejecutar propuesta

Luego de alcanzar el threshold, se llamó a:

```solidity
executeProposal(0)
```

Se verificó que:

* la propuesta queda con `executed = true`.
* la propuesta mantiene `cancelled = false`.

### 6. Rechazo de ejecución duplicada

Se intentó ejecutar nuevamente la misma propuesta.

El contrato rechazó la operación con el error:

```solidity
AlreadyExecuted
```

### 7. Rechazo de cancelación de propuesta ejecutada

Se intentó cancelar una propuesta ya ejecutada.

El contrato rechazó la operación con el error:

```solidity
AlreadyExecuted
```

### 8. Cancelar propuesta pendiente

Se creó una nueva propuesta y el proponente original la canceló llamando a:

```solidity
cancelProposal(1)
```

Se verificó que:

* la propuesta queda con `cancelled = true`.
* la propuesta mantiene `executed = false`.

## Despliegue en Sepolia

Pendiente de completar.

Dirección del contrato desplegado en Sepolia:

```text
Pendiente
```

Wallets utilizadas como signers:

```text
Pendiente
```

Threshold configurado:

```text
Pendiente
```

## Frontend

Pendiente de completar.

El frontend será implementado en React y permitirá:

* conectar una wallet,
* verificar si la wallet conectada es signer,
* listar propuestas,
* crear propuestas,
* aprobar propuestas,
* ejecutar propuestas cuando se alcance el threshold,
* mostrar información general del contrato.

## Integrantes

Pendiente de completar.
