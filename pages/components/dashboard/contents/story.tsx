import TreeD from "react-d3-tree";
import { useContainerSize } from "../../../../src/helpers/windowSize";
import {
  CustomNodeElementProps,
  TreeNodeDatum,
} from "react-d3-tree/lib/types/common";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "../../common/modal";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { firestore, firebase } from "../../../../src/firebase";
import { Story, storyConverter } from "../../../../src/types/story";
import useFirebaseAuth from "../../../../src/helpers/FBAuthApi";
import { Menu, Transition } from "@headlessui/react";
import SelectOptionsSearch from "../../common/selectOptionsSearch";
import Loader from "../../common/loader";
import { getSessionStorageOrDefault } from "../../../../src/helpers/commonFunction";
import { SS_SHOW_TOUR_KEY } from "../../../../src/helpers/constants";

interface IForeignObjectProps {
  width: number;
  height: number;
  x: number;
  y: number;
}
interface ITreeCreationParameter {
  customeNodeParam: CustomNodeElementProps;
  foreignObjectProps: IForeignObjectProps;
}

const TreeComponent = (prop: IProp) => {
  const [storyData, setStoryData] = useState({
    name: "Author",
    children: [
      {
        name: "Title1",
        attributes: {
          content: "Content",
        },
        children: [
          {
            name: "Choice1",
            attributes: {
              content: "Content1",
            },
            children: [
              {
                name: "Choice1",
              },
              {
                name: "Choice2",
              },
            ],
          },
          {
            name: "Choice2",
            attributes: {
              content: "Content2",
            },
            children: [
              {
                name: "Choice1",
              },
              {
                name: "Choice2",
              },
            ],
          },
        ],
      },
    ],
  });
  const [showSelectOptions, setShowSelectOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState({} as TreeNodeDatum);
  const { width, height } = useContainerSize(".tree-container");
  const nodeSize = { x: width / 4, y: height / 3 };
  const openEditModal = useCallback(
    (node: TreeNodeDatum, e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setShowModal(!showModal);
      setSelectedNode(node);
    },
    [showModal]
  );
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);
  const renderForeignObjectNode = useCallback(
    (props: ITreeCreationParameter) => {
      const { customeNodeParam, foreignObjectProps } = { ...props };
      const { nodeDatum, toggleNode, hierarchyPointNode } = customeNodeParam;
      const isBranchNode = !!nodeDatum.children;
      const isLeafNode = !nodeDatum.children;
      const isRootNode = nodeDatum.__rd3t.depth === 0;

      if (isRootNode) {
        return (
          <g strokeWidth={0} stroke="#8a8a8a">
            <>
              <circle r={18} fill="#578aef" />
              <circle r={16} fill="#fff" />
              <circle r={14} fill="#578aef" />
            </>
            <foreignObject {...foreignObjectProps}>
              <div className={`w-[${foreignObjectProps.width}px] mx-auto`}>
                <div className="overflow-hidden shadow-md">
                  <div className="px-6 py-4 bg-white border-b border-gray-200 font-bold uppercase">
                    {nodeDatum.name}
                  </div>
                </div>
              </div>
            </foreignObject>
          </g>
        );
      }

      return (
        <g onClick={toggleNode} strokeWidth={0}>
          <>
            <circle r={18} fill="#578aef" />
            <circle r={16} fill="#fff" />
            <circle r={14} fill="#578aef" />
          </>
          {/* `foreignObject` requires width & height to be explicitly set. */}
          <foreignObject {...foreignObjectProps}>
            <div className={`w-[${foreignObjectProps.width}px] mx-auto`}>
              <div className="overflow-hidden shadow-md">
                <div className="px-6 py-4 bg-white border-b border-gray-200 font-bold uppercase">
                  {nodeDatum.name}
                </div>

                {nodeDatum.attributes?.content && (
                  <div className="p-6 bg-white border-b border-gray-200">
                    {nodeDatum.attributes?.content}
                  </div>
                )}

                <div className="p-6 bg-white border-gray-200 text-right">
                  <a
                    className="bg-blue-500 shadow-md text-sm text-white font-bold py-3 md:px-8 px-4 hover:bg-blue-400 rounded uppercase"
                    href="#"
                    onClick={(e) => openEditModal(nodeDatum, e)}
                  >
                    Edit
                  </a>
                </div>
              </div>
            </div>
          </foreignObject>
        </g>
      );
    },
    [openEditModal]
  );

  // Tour Guide
  const [run, setRun] = useState(false);
  const [tourSteps, setTourSteps] = useState([
    {
      content:
        "You can swipe the story tree and use scroll to zoom in and out.",
      placement: "bottom",
      styles: {
        options: {
          width: 300,
        },
      },
      target: ".tree-container",
      title: "Stories Tree",
      disableBeacon: false,
    },
  ] as Step[]);
  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type } = data;
      const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
      if (finishedStatuses.includes(status)) {
        setRun(false);
        sessionStorage.setItem(SS_SHOW_TOUR_KEY, "false");
      }
    },
    [setRun]
  );
  useEffect(() => {
    const isFirstTime = getSessionStorageOrDefault<boolean>(
      SS_SHOW_TOUR_KEY,
      true
    );
    if (isFirstTime) {
      setRun(true);
    } else {
      setRun(false);
    }
    return () => {
      document.getElementById("react-joyride-portal")?.remove();
      document.getElementById("react-joyride-step-0")?.remove();
    };
  }, []);
  // End Tour Guide

  // Firebase section
  const { authUser, loading } = useFirebaseAuth();
  const [showLoader, setShowLoader] = useState(false);
  const [stories, setStories] = useState([] as Story[]);
  const [selectedStory, setSelectedStory] = useState({} as Story);
  useEffect(() => {
    if (!stories || loading) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [stories, loading]);
  useEffect(() => {
    if (!authUser) {
      // auth user not ready
      return;
    }
    const unsubscribe = firestore
      .collection("story")
      .where("creator", "==", authUser?.email)
      .withConverter(storyConverter)
      .onSnapshot((snap) => {
        const data = snap.docs.map((doc) => doc.data());
        if (data) {
          setStories(data);
        }
      });
    return () => unsubscribe();
  }, [authUser]);
  const getOptions = useCallback(() => {
    return stories.map((x) => x.title!);
  }, [stories]);
  const optionSelectedHandler = useCallback(
    (s, i) => {
      setSelectedStory(stories[i]);
      console.log(stories[i]);
    },
    [setSelectedStory, stories]
  );
  // End of Firebase section
  return (
    // `<Tree />` will fill width/height of its container; in this case `#treeWrapper`.
    <>
      {showLoader && <Loader />}
      {showModal && (
        <Modal
          headerString={`Edit ${selectedNode.name}`}
          cancelButtonString="Cancel"
          onCancelHandler={handleCloseModal}
          onSubmitHandler={() => {}}
          submitButtonString="Submit"
        >
          <form></form>
        </Modal>
      )}
      {run && (
        <Joyride
          callback={handleJoyrideCallback}
          continuous={false}
          run={run}
          showSkipButton={true}
          steps={tourSteps}
        />
      )}
      <SelectOptionsSearch
        defaultSelectedOption="Please choose one of your stories"
        options={getOptions()}
        onOptionSelectedHandler={optionSelectedHandler}
      />
      <div className="flex justify-between h-full tree-container">
        <TreeD
          data={storyData}
          shouldCollapseNeighborNodes={true}
          enableLegacyTransitions={true}
          zoomable={true}
          scaleExtent={{ max: 2, min: 0.1 }}
          orientation={"horizontal"}
          pathFunc={"step"}
          translate={{ x: width / 5, y: height / 4 }}
          renderCustomNodeElement={(customeNodeParam) =>
            renderForeignObjectNode({
              customeNodeParam,
              foreignObjectProps: {
                width: nodeSize.x * 0.75,
                height: nodeSize.y,
                y: 32,
                x: -(nodeSize.x * 0.75) / 2,
              },
            })
          }
          nodeSize={{ x: nodeSize.x, y: nodeSize.y }}
          rootNodeClassName="node__root"
          initialDepth={2}
          branchNodeClassName="node__branch"
          leafNodeClassName="node__leaf"
        />
      </div>
    </>
  );
};

interface IProp {}
export default React.memo(TreeComponent);
